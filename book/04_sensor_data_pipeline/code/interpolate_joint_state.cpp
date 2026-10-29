#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

struct Sample {
  double time_s;
  std::vector<double> position;
};

Sample interpolate(const Sample& before, const Sample& after, double query_s) {
  if (!(before.time_s < after.time_s)) {
    throw std::invalid_argument("timestamps must be strictly increasing");
  }
  if (query_s < before.time_s || query_s > after.time_s) {
    throw std::out_of_range("query requires extrapolation");
  }
  if (before.position.size() != after.position.size()) {
    throw std::invalid_argument("joint vector sizes differ");
  }
  const double alpha = (query_s - before.time_s) / (after.time_s - before.time_s);
  Sample result{query_s, std::vector<double>(before.position.size())};
  for (std::size_t i = 0; i < result.position.size(); ++i) {
    result.position[i] = (1.0 - alpha) * before.position[i] + alpha * after.position[i];
  }
  return result;
}

int main() {
  const Sample q0{0.020, {0.10, -0.04}};
  const Sample q1{0.040, {0.20, -0.08}};
  const Sample aligned = interpolate(q0, q1, 0.033);
  std::cout << std::fixed << std::setprecision(3) << "t=" << aligned.time_s << " q=["
            << aligned.position[0] << ", " << aligned.position[1] << "]\n";
  try {
    (void)interpolate(q1, q0, 0.033);
  } catch (const std::invalid_argument& error) {
    std::cout << "reversal rejected: " << error.what() << '\n';
  }
}

