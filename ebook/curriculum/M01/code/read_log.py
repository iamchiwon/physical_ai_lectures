"""Standard-library teaching example; no robot or network access."""
import csv
import io
import math

SAMPLE = "stamp_s,position_mm\n0.000,100\n0.020,110\n0.040,bad\n"


def parse_log(text):
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != ["stamp_s", "position_mm"]:
        raise ValueError("header must be stamp_s,position_mm")
    accepted, rejected = [], []
    for line, row in enumerate(reader, start=2):
        try:
            if set(row) != {"stamp_s", "position_mm"}:
                raise ValueError("unexpected columns")
            stamp = float(row["stamp_s"])
            millimetres = float(row["position_mm"])
            if not math.isfinite(stamp) or not math.isfinite(millimetres):
                raise ValueError("non-finite value")
            if stamp < 0:
                raise ValueError("negative relative time")
            accepted.append((stamp, millimetres / 1000.0))
        except (TypeError, ValueError):
            rejected.append(line)
    return accepted, rejected


if __name__ == "__main__":
    accepted, rejected = parse_log(SAMPLE)
    for stamp, metres in accepted:
        print(f"{stamp:.3f}s {metres:.3f}m")
    print("rejected lines:", rejected)
