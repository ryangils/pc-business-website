# CyberForge PC — C++ Product Catalog Utility
# ─────────────────────────────────────────────

CXX      := g++
CXXFLAGS := -std=c++17 -O2 -Wall -Wextra
TARGET   := product_catalog
SRC      := product_catalog.cpp

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRC)
	@echo "Build successful → ./$(TARGET)"

run: all
	./$(TARGET)

clean:
	rm -f $(TARGET) catalog.json
