"use client";

import { useId, useMemo, useState } from "react";
import { calculateThreshold } from "@/lib/threshold-model";

const metric = (value: number | null) => value === null ? "정의 안 됨 (분모 0)" : value.toFixed(4);
export function ThresholdConceptLab() {
  const id = useId();
  const [threshold, setThreshold] = useState(50), [fpCost, setFpCost] = useState(1), [fnCost, setFnCost] = useState(1);
  const result = useMemo(() => calculateThreshold(threshold, fpCost, fnCost), [threshold, fpCost, fnCost]);
  return <section id="threshold-concept-lab" aria-labelledby={`${id}-title`} className="mt-7 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 [overflow-wrap:anywhere] sm:p-6">
    <h2 id={`${id}-title`} className="text-xl font-bold">선택 보충 · 이진 임계값과 오류 비용</h2>
    <p className="mt-3 text-sm leading-7">가상 점수·정답 8행을 고정하고 점수 ≥ 임계값이면 양성으로 분류합니다. 점수는 보정된 확률이나 실제 모델 학습 결과가 아닙니다. 검출 IoU·AP·mAP·작업 성공률을 계산하는 모형도 아닙니다.</p>
    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3">{[{ key: "threshold", label: "양성 임계값", value: threshold, max: 100, step: 5, display: (threshold / 100).toFixed(2), set: setThreshold }, { key: "fp", label: "FP 한 건의 가상 비용", value: fpCost, max: 10, step: 0.5, display: fpCost.toFixed(1), set: setFpCost }, { key: "fn", label: "FN 한 건의 가상 비용", value: fnCost, max: 10, step: 0.5, display: fnCost.toFixed(1), set: setFnCost }].map(control => <label key={control.key} htmlFor={`${id}-${control.key}`} className="min-w-0 rounded-xl border bg-white p-3"><span className="flex flex-wrap justify-between gap-2 text-xs font-semibold"><span>{control.label}</span><output>{control.display}</output></span><input id={`${id}-${control.key}`} type="range" min={0} max={control.max} step={control.step} value={control.value} className="mt-3 w-full accent-blue-700" onChange={event => control.set(Number(event.target.value))} /></label>)}</div>
    <dl className="mt-4 grid min-w-0 grid-cols-2 gap-3 rounded-xl border bg-white p-3 text-sm leading-7">{([['TP', result.TP], ['FP', result.FP], ['FN', result.FN], ['TN', result.TN], ['Precision', metric(result.precision)], ['Recall', metric(result.recall)], ['F1', metric(result.f1)], ['8행의 가상 비용 합계', result.totalCost.toFixed(2)]] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl>
    <p className="mt-3 text-xs leading-6">비용 합계 = FP × FP 단가 + FN × FN 단가 (가상 비용 단위)입니다. 평균 비용이 아니며 실제 안전·경제 손실의 예측이 아닙니다.</p>
    <div className="mt-4 max-w-full overflow-x-auto rounded-xl border bg-white p-2" role="region" aria-label="가상 8행의 정답과 예측 표, 가로 스크롤 가능" tabIndex={0}><table className="w-full whitespace-nowrap text-xs"><caption className="p-2 text-left">고정 가상 기록 · 정답 1은 양성, 0은 음성</caption><thead><tr>{['행', '점수', '정답', '예측', '분류'].map(label => <th scope="col" key={label} className="p-2 text-right">{label}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}><th scope="row" className="p-2 text-right">{index + 1}</th><td className="p-2 text-right">{(row.scorePercent / 100).toFixed(2)}</td><td className="p-2 text-right">{row.label}</td><td className="p-2 text-right">{row.predicted ? 1 : 0}</td><td className="p-2 text-right">{row.outcome}</td></tr>)}</tbody></table></div>
    <details className="mt-4 rounded-xl border bg-white p-3 text-sm leading-7"><summary className="cursor-pointer font-semibold">계산 규칙과 한계</summary><p className="mt-3">TP/FP는 예측 양성 중 정답 양성/음성, FN/TN은 예측 음성 중 정답 양성/음성입니다. Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2TP/(2TP+FP+FN)입니다. 분모가 0이면 정의되지 않으며 0으로 바꾸지 않습니다. 이 고정 표에는 실제 양성이 네 개라 Recall과 F1의 분모는 항상 양수입니다.</p><p className="mt-3">점수와 임계값을 같은 0~100 정수 눈금으로 비교한 뒤 0~1로 표시합니다. 따라서 임계값 0.95에서 점수 0.95는 양성입니다. 임계값을 낮추면 양성 예측이 늘지만 모든 지표나 실제 작업 성능이 좋아진다는 뜻은 아닙니다.</p></details>
    <p className="mt-4 text-xs leading-6 text-slate-600">이 선택 보충은 본문·실습·세 문항과 별도입니다. 조작은 답안·진도·학습 완료를 자동 저장하거나 변경하지 않습니다.</p>
  </section>;
}
