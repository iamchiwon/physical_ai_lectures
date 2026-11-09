#!/usr/bin/env python3
"""CPU-only one-axis BC and synthetic rollout. No robot/network access."""
import argparse
import copy
import hashlib
import json
import math
import platform
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCENARIOS = ('nominal', 'shifted-dynamics', 'stale', 'wrong-version', 'missing-observation', 'rollback')
CONTRACT = {'clock_id': 'ClockA', 'robot_id': 'r1', 'boot_id': 'bootA', 'map_revision': 'map-v7',
            'model_revision': 'model-v3', 'calibration_revision': 'cal-c2', 'frame_id': 'map',
            'unit': 'm', 'action_schema': 'velocity-map-x-v1', 'bundle_id': 'bundle-A'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def keys(row, expected, label):
    require(isinstance(row, dict) and set(row) == set(expected), label + ': unexpected or missing keys')


def finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def integer(value):
    return type(value) is int and value >= 0


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def read_json(file):
    raw = Path(file).read_bytes()
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, 'duplicate JSON key: ' + key)
            result[key] = value
        return result
    value = json.loads(raw, object_pairs_hook=unique,
                       parse_constant=lambda value: (_ for _ in ()).throw(ValueError('non-finite JSON: ' + value)))
    return value, digest(raw)


def validate(config, data, cases):
    keys(config, ['schema_version', 'initial_x_m', 'dt_s', 'steps', 'success_radius_m', 'max_speed_mps',
                  'observation_ttl_ms', 'command_ttl_ms', 'admission_delay_ms', *CONTRACT], 'config')
    require(type(config['schema_version']) is int and config['schema_version'] == 1, 'config version')
    for key, expected in CONTRACT.items():
        require(config[key] == expected, 'config contract: ' + key)
    for key in ['initial_x_m', 'dt_s', 'success_radius_m', 'max_speed_mps']:
        require(finite(config[key]), 'config number: ' + key)
    require(abs(config['initial_x_m']) <= 100 and config['dt_s'] == 0.5, 'config position/dt range (fixed 0.5s clock)')
    require(0 < config['success_radius_m'] < abs(config['initial_x_m']) and 0 < config['max_speed_mps'] <= 1,
            'config radius/speed range')
    require(integer(config['steps']) and 1 <= config['steps'] <= 1000, 'config steps')
    for key in ['observation_ttl_ms', 'command_ttl_ms', 'admission_delay_ms']:
        require(integer(config[key]) and config[key] <= 10000, 'config time: ' + key)
    require(config['admission_delay_ms'] <= min(config['observation_ttl_ms'], config['command_ttl_ms']),
            'admission delay outside TTL')
    keys(data, ['schema_version', 'rows'], 'data')
    require(type(data['schema_version']) is int and data['schema_version'] == 1 and isinstance(data['rows'], list), 'data version/rows')
    ids, sessions, counts = set(), {}, {split: 0 for split in ['train', 'validation', 'test']}
    for row in data['rows']:
        keys(row, ['id', 'session', 'split', 'x_m', 'u_mps'], 'demonstration')
        require(isinstance(row['id'], str) and row['id'] and row['id'] not in ids, 'demonstration ID')
        require(isinstance(row['session'], str) and row['session'], 'session ID')
        require(isinstance(row['split'], str) and row['split'] in counts, 'split')
        require(finite(row['x_m']) and finite(row['u_mps']) and abs(row['u_mps']) <= config['max_speed_mps'], 'demonstration range')
        prior = sessions.setdefault(row['session'], row['split'])
        require(prior == row['split'], 'session split leakage: ' + row['session'])
        counts[row['split']] += 1
        ids.add(row['id'])
    require(counts['train'] >= 2 and counts['validation'] >= 1 and counts['test'] >= 1, 'empty or insufficient split')
    keys(cases, ['schema_version', 'scenarios'], 'cases')
    require(type(cases['schema_version']) is int and cases['schema_version'] == 1 and isinstance(cases['scenarios'], list), 'cases version')
    seen = set()
    for case in cases['scenarios']:
        keys(case, ['id', 'gain', 'events'], 'case')
        require(isinstance(case['id'], str) and case['id'] in SCENARIOS and case['id'] not in seen, 'scenario ID')
        require(finite(case['gain']) and case['gain'] in (0, 1), 'synthetic gain')
        require(isinstance(case['events'], list), 'events')
        ticks = set()
        for event in case['events']:
            keys(event, ['tick', 'kind'], 'event')
            require(integer(event['tick']) and event['tick'] < config['steps'] and event['tick'] not in ticks, 'event tick')
            require(isinstance(event['kind'], str) and event['kind'] in ('stale', 'wrong-version', 'missing-observation', 'rollback'), 'event kind')
            ticks.add(event['tick'])
        seen.add(case['id'])
    require(seen == set(SCENARIOS), 'six scenarios required for denominator')
    return counts


def learn(data):
    train = [row for row in data['rows'] if row['split'] == 'train']
    xm = sum(row['x_m'] for row in train) / len(train)
    um = sum(row['u_mps'] for row in train) / len(train)
    denominator = sum((row['x_m'] - xm) ** 2 for row in train)
    require(finite(denominator) and denominator > 1e-12, 'degenerate/non-finite training input')
    a = sum((row['x_m'] - xm) * (row['u_mps'] - um) for row in train) / denominator
    b = um - a * xm
    require(finite(a) and finite(b), 'non-finite fitted policy')
    policies = {'affine': {'a': a, 'b': b}, 'zero': {'a': 0.0, 'b': 0.0}}
    def mse(policy, split):
        rows = [row for row in data['rows'] if row['split'] == split]
        value = sum((policy['a'] * row['x_m'] + policy['b'] - row['u_mps']) ** 2 for row in rows) / len(rows)
        require(finite(value), 'non-finite metric')
        return value
    validation = {name: mse(policy, 'validation') for name, policy in policies.items()}
    selected = 'affine' if validation['affine'] < validation['zero'] else 'zero'
    # Locked test is evaluated only after the selection above.
    test = {name: mse(policy, 'test') for name, policy in policies.items()}
    return {'policies': policies, 'selected_policy_id': selected, 'validation_mse_mps2': validation,
            'locked_test_mse_mps2': test, 'train_ids': [row['id'] for row in train]}


def admission(config, observation, command, now_ms):
    if not integer(now_ms):
        return 'invalid_admission_time'
    if not isinstance(observation, dict):
        return 'missing_observation'
    fields = {*CONTRACT, 'stamp_ms', 'transform_stamp_ms', 'x_m'}
    if set(observation) != fields:
        return 'observation_format'
    for key in CONTRACT:
        if observation[key] != config[key]:
            return 'contract_mismatch:' + key
    if not finite(observation['x_m']):
        return 'position_format'
    stamp = observation['stamp_ms']
    if not integer(stamp) or not integer(observation['transform_stamp_ms']):
        return 'observation_time_format'
    if observation['transform_stamp_ms'] != stamp:
        return 'transform_time_mismatch'
    age = now_ms - stamp
    if age < 0 or age > config['observation_ttl_ms']:
        return 'observation_age'
    if not isinstance(command, dict) or set(command) != {'issued_ms', 'request_id', 'epoch', 'bundle_id', 'action_schema'}:
        return 'command_format'
    if not integer(command['issued_ms']) or not isinstance(command['request_id'], str) or not command['request_id'] or not integer(command['epoch']) or command['epoch'] < 1:
        return 'command_identity_or_time'
    if command['bundle_id'] != config['bundle_id'] or command['action_schema'] != config['action_schema']:
        return 'command_bundle_mismatch'
    if not 0 <= now_ms - command['issued_ms'] <= config['command_ttl_ms']:
        return 'command_age'
    return None


def rollout(config, case, policy):
    x, epoch = config['initial_x_m'], 1
    rows, commands, terminal = [], 0, 'HORIZON_FAILED'
    events = {event['tick']: event['kind'] for event in case['events']}
    for tick in range(config['steps']):
        now = 1000 + 500 * tick
        observation = {**CONTRACT, 'stamp_ms': now, 'transform_stamp_ms': now, 'x_m': x}
        command = {'issued_ms': now, 'request_id': case['id'] + '-q' + str(tick), 'epoch': epoch,
                   'bundle_id': config['bundle_id'], 'action_schema': config['action_schema']}
        kind = events.get(tick)
        if kind == 'stale':
            observation['stamp_ms'] = observation['transform_stamp_ms'] = now - 201
        elif kind == 'wrong-version':
            observation['map_revision'] = 'map-v8'
        elif kind == 'missing-observation':
            observation = None
        elif kind == 'rollback':
            command['bundle_id'], command['action_schema'] = 'bundle-B', 'position-map-x-v2'
        check_time = now + config['admission_delay_ms']
        reason = admission(config, observation, command, check_time)
        row = {'tick': tick, 'heartbeat_stamp_ms': now, 'admission_ms': check_time,
               'observation': observation, 'request': command, 'reason': reason,
               'observation_age_ms': check_time - observation['stamp_ms'] if observation else None,
               'current_x_m': observation['x_m'] if reason is None else None, 'last_simulated_x_m': x,
               'new_command': None, 'next_simulated_observation': None}
        if reason:
            terminal = 'ROLLBACK_HOLD' if kind == 'rollback' else 'INVALID_STOP'
            if kind == 'rollback':
                epoch += 1
                row['rollback'] = {'selected_bundle': 'bundle-A', 'new_epoch': epoch,
                                   'pending_chunks_discarded': True, 'resumed': False,
                                   'physical_state_restored': False}
            row['outcome'] = terminal
            rows.append(row)
            break
        raw = policy['a'] * x + policy['b']
        require(finite(raw), 'non-finite command')
        u = max(-config['max_speed_mps'], min(config['max_speed_mps'], raw))
        x = x + config['dt_s'] * case['gain'] * u
        require(finite(x), 'non-finite synthetic state')
        commands += 1
        row['new_command'] = {'raw_u_mps': raw, 'limited_u_mps': u, 'effect': 'synthetic_only'}
        row['next_simulated_observation'] = {'x_m': x, 'stamp_ms': now + 500, 'source': 'noiseless_one_axis_model'}
        row['outcome'] = 'SIMULATED_SUCCEEDED' if abs(x) <= config['success_radius_m'] else 'SIMULATED_STEP'
        rows.append(row)
        if row['outcome'] == 'SIMULATED_SUCCEEDED':
            terminal = row['outcome']
            break
    return {'scenario': case['id'], 'input_case': copy.deepcopy(case), 'mode': 'synthetic_closed_loop',
            'terminal_state': terminal, 'simulated_success': terminal == 'SIMULATED_SUCCEEDED',
            'command_count': commands, 'final_simulated_x_m': x, 'epoch': epoch,
            'processed_ticks': len(rows), 'unprocessed_ticks': config['steps'] - len(rows),
            'ticks': rows, 'real_robot_or_safety_verified': False}


def evaluate(config, data, cases, policy_id='selected'):
    counts = validate(config, data, cases)
    training = learn(data)
    evaluated = training['selected_policy_id'] if policy_id == 'selected' else policy_id
    require(evaluated in training['policies'], 'unknown evaluation policy')
    results = [rollout(config, case, training['policies'][evaluated]) for case in cases['scenarios']]
    successes = sum(row['simulated_success'] for row in results)
    return {'schema_version': 1, 'mode': 'train_select_locked_test_and_simulate', 'split_counts': counts,
            'demonstrations': copy.deepcopy(data), 'training': training, 'evaluated_policy_id': evaluated,
            'total_experiments': len(results), 'simulated_successes': successes,
            'simulated_success_rate': successes / len(results),
            'invalid_experiments': sum(row['terminal_state'] == 'INVALID_STOP' for row in results),
            'results': results, 'real_robot_or_safety_verified': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=HERE / 'config.json')
    parser.add_argument('--data', type=Path, default=HERE / 'data.json')
    parser.add_argument('--cases', type=Path, default=HERE / 'cases.json')
    parser.add_argument('--policy', choices=['selected', 'zero'], default='selected')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        config, config_sha = read_json(args.config)
        data, data_sha = read_json(args.data)
        cases, cases_sha = read_json(args.cases)
        report = evaluate(config, data, cases, args.policy)
        report.update({'python': platform.python_version(), 'platform': platform.system(),
                       'source_sha256': digest(Path(__file__).read_bytes()), 'config_sha256': config_sha,
                       'data_sha256': data_sha, 'cases_sha256': cases_sha})
        raw = json.dumps(report, ensure_ascii=False, allow_nan=False, indent=2) + '\n'
        if args.output:
            # Exclusive creation also prevents source/input/report overwrites and symlink following.
            with args.output.open('x', encoding='utf8') as handle:
                handle.write(raw)
        else:
            print(raw, end='')
    except (ValueError, OSError, KeyError, TypeError, OverflowError) as exc:
        parser.exit(2, 'P4 input/output error: ' + str(exc) + '\n')


if __name__ == '__main__':
    main()
