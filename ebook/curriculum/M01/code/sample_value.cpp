#include <iomanip>
#include <iostream>

struct Sample {
    double stamp_s;
    double position_m;
};

Sample shifted(Sample sample, double dx_m) {
    sample.position_m += dx_m;
    return sample;
}

double position_of(const Sample& sample) {
    return sample.position_m;
}

int main() {
    Sample current{0.0, 0.1};
    const Sample* view = &current;
    Sample next = shifted(current, 0.02);
    std::cout << std::fixed << std::setprecision(3)
              << position_of(*view) << " " << next.position_m << "\n";
}
