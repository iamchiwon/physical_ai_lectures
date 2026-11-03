#include <cmath>
#include <iomanip>
#include <iostream>
#include <optional>
#include <string>

std::optional<double> decode_metres(int version, const std::string& unit,
                                    double value) {
    if (version != 1 || unit != "mm" || !std::isfinite(value)) {
        return std::nullopt;
    }
    return value / 1000.0;
}

int main() {
    const auto accepted = decode_metres(1, "mm", 250.0);
    const auto rejected = decode_metres(1, "m", 250.0);
    if (accepted) {
        std::cout << std::fixed << std::setprecision(3) << *accepted << " m\n";
    }
    std::cout << "unsupported unit accepted: " << std::boolalpha
              << rejected.has_value() << "\n";
}
