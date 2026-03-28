/*
 * CyberForge PC — Product Catalog Manager
 * ----------------------------------------
 * A command-line C++ utility for managing the product catalog.
 *
 * Features:
 *   - List all products (PCs and Cases)
 *   - Filter products by type, max price, and brand
 *   - Export catalog to JSON
 *   - Display product details
 *   - Generate a basic pricing summary report
 *
 * Build:
 *   make
 *
 * Usage:
 *   ./product_catalog                  -- interactive menu
 *   ./product_catalog --list           -- list all products
 *   ./product_catalog --list pcs       -- list PCs only
 *   ./product_catalog --list cases     -- list cases only
 *   ./product_catalog --detail pc-001  -- show product details
 *   ./product_catalog --export         -- export to catalog.json
 *   ./product_catalog --report         -- print pricing report
 */

#include <algorithm>
#include <cstdlib>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>

// ─────────────────────────────────────────────────────────────────────────────
// Data structures
// ─────────────────────────────────────────────────────────────────────────────

struct Spec {
    std::string key;
    std::string value;
};

struct Product {
    std::string id;
    std::string type;   // "pc" | "case"
    std::string name;
    std::string brand;
    double      price;
    double      oldPrice;  // 0 if no sale
    std::string badge;
    std::string description;
    double      rating;
    int         reviews;
    bool        inStock;
    std::vector<Spec> specs;
};

// ─────────────────────────────────────────────────────────────────────────────
// Catalog data
// ─────────────────────────────────────────────────────────────────────────────

static std::vector<Product> buildCatalog() {
    std::vector<Product> catalog;

    // ── PCs ──────────────────────────────────────────────────────────────────
    catalog.push_back({
        "pc-001", "pc", "Titan Pro X", "CyberForge",
        2499.0, 2899.0, "HOT",
        "The ultimate gaming powerhouse built for 4K dominance.",
        4.9, 142, true,
        {{"CPU","Intel Core i9-14900K"},{"GPU","NVIDIA RTX 4090 24GB"},
         {"RAM","64GB DDR5 6000MHz"},{"Storage","2TB NVMe Gen5"},
         {"Cooling","360mm AIO Liquid"},{"PSU","1000W 80+ Platinum"},
         {"OS","Windows 11 Pro"}}
    });
    catalog.push_back({
        "pc-002", "pc", "Vortex Builder", "CyberForge",
        1299.0, 0.0, "NEW",
        "Mid-range powerhouse delivering exceptional value.",
        4.7, 89, true,
        {{"CPU","AMD Ryzen 7 7800X3D"},{"GPU","NVIDIA RTX 4070 Ti 12GB"},
         {"RAM","32GB DDR5 5600MHz"},{"Storage","1TB NVMe Gen4"},
         {"Cooling","240mm AIO Liquid"},{"PSU","750W 80+ Gold"},
         {"OS","Windows 11 Home"}}
    });
    catalog.push_back({
        "pc-003", "pc", "Nexus Core", "CyberForge",
        799.0, 999.0, "SALE",
        "Entry-level gaming PC that punches above its price tag.",
        4.5, 213, true,
        {{"CPU","AMD Ryzen 5 7600"},{"GPU","NVIDIA RTX 4060 8GB"},
         {"RAM","16GB DDR5 5200MHz"},{"Storage","512GB NVMe Gen4"},
         {"Cooling","Tower Air Cooler"},{"PSU","650W 80+ Gold"},
         {"OS","Windows 11 Home"}}
    });
    catalog.push_back({
        "pc-004", "pc", "Phantom Elite", "CyberForge",
        3499.0, 0.0, "CUSTOM",
        "Professional workstation for rendering, video, and AI.",
        5.0, 28, false,   // made to order
        {{"CPU","AMD Threadripper PRO 7975WX"},{"GPU","NVIDIA RTX 4090 x2"},
         {"RAM","256GB ECC DDR5"},{"Storage","8TB NVMe RAID"},
         {"Cooling","420mm AIO Liquid"},{"PSU","1600W 80+ Titanium"},
         {"OS","Windows 11 Pro Workstations"}}
    });
    catalog.push_back({
        "pc-005", "pc", "Surge X Stream", "CyberForge",
        999.0, 0.0, "",
        "The dedicated streaming and content creation rig.",
        4.6, 55, true,
        {{"CPU","Intel Core i7-14700K"},{"GPU","AMD Radeon RX 7800 XT 16GB"},
         {"RAM","32GB DDR5 5600MHz"},{"Storage","1TB NVMe + 2TB HDD"},
         {"Cooling","280mm AIO Liquid"},{"PSU","750W 80+ Gold"},
         {"OS","Windows 11 Home"}}
    });
    catalog.push_back({
        "pc-006", "pc", "Aurora RGB Max", "CyberForge",
        1799.0, 0.0, "NEW",
        "Maximum RGB spectacle meets maximum gaming performance.",
        4.8, 76, true,
        {{"CPU","Intel Core i9-14900KF"},{"GPU","NVIDIA RTX 4080 Super 16GB"},
         {"RAM","64GB DDR5 ARGB 6400MHz"},{"Storage","2TB NVMe Gen5"},
         {"Cooling","360mm ARGB AIO"},{"PSU","850W 80+ Gold"},
         {"OS","Windows 11 Home"}}
    });

    // ── Cases ─────────────────────────────────────────────────────────────────
    catalog.push_back({
        "case-001", "case", "Obsidian Tower", "Fractal Design",
        149.0, 179.0, "HOT",
        "Full tower with tempered glass and excellent cable management.",
        4.8, 94, true,
        {{"Form Factor","Full Tower"},{"Motherboard","E-ATX / ATX"},
         {"Max GPU","420mm"},{"Max Cooler","185mm"},
         {"Drive Bays","4x 3.5\" + 6x 2.5\""},{"Included Fans","8x 140mm"}}
    });
    catalog.push_back({
        "case-002", "case", "Neon Cube RGB", "CyberForge",
        89.0, 0.0, "NEW",
        "Mid-tower with 4 pre-installed ARGB fans and panoramic glass.",
        4.6, 132, true,
        {{"Form Factor","Mid Tower"},{"Motherboard","ATX / mATX"},
         {"Max GPU","380mm"},{"Max Cooler","165mm"},
         {"Drive Bays","2x 3.5\" + 4x 2.5\""},{"Included Fans","4x 120mm ARGB"}}
    });
    catalog.push_back({
        "case-003", "case", "Vortex Mini ITX", "Cooler Master",
        79.0, 0.0, "",
        "Compact mini-ITX case with surprising cooling performance.",
        4.4, 67, true,
        {{"Form Factor","Mini-ITX"},{"Motherboard","Mini-ITX"},
         {"Max GPU","330mm"},{"Max Cooler","155mm"},
         {"Drive Bays","1x 3.5\" + 2x 2.5\""},{"Included Fans","2x 120mm"}}
    });
    catalog.push_back({
        "case-004", "case", "CrystalArc 360", "CyberForge",
        119.0, 149.0, "SALE",
        "Panoramic tempered glass on three sides.",
        4.7, 48, true,
        {{"Form Factor","Mid Tower"},{"Motherboard","ATX / mATX / Mini-ITX"},
         {"Max GPU","400mm"},{"Max Cooler","170mm"},
         {"Drive Bays","3x 3.5\" + 4x 2.5\""},{"Included Fans","3x 140mm ARGB"}}
    });
    catalog.push_back({
        "case-005", "case", "Phantom Shell Mesh", "NZXT",
        99.0, 0.0, "",
        "Perforated mesh front panel for optimal airflow.",
        4.5, 81, true,
        {{"Form Factor","Mid Tower"},{"Motherboard","ATX / mATX"},
         {"Max GPU","365mm"},{"Max Cooler","165mm"},
         {"Drive Bays","2x 3.5\" + 4x 2.5\""},{"Included Fans","2x 140mm"}}
    });
    catalog.push_back({
        "case-006", "case", "Eclipse Pro ARGB", "CyberForge",
        179.0, 0.0, "CUSTOM",
        "Premium full tower with integrated ARGB controller.",
        4.9, 33, true,
        {{"Form Factor","Full Tower"},{"Motherboard","EATX / ATX"},
         {"Max GPU","450mm"},{"Max Cooler","190mm"},
         {"Drive Bays","6x 3.5\" + 8x 2.5\""},{"Included Fans","6x 140mm ARGB"}}
    });

    return catalog;
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal colours (ANSI)
// ─────────────────────────────────────────────────────────────────────────────

static const char* RESET  = "\033[0m";
static const char* CYAN   = "\033[96m";
static const char* PURPLE = "\033[95m";
static const char* GREEN  = "\033[92m";
static const char* YELLOW = "\033[93m";
static const char* BOLD   = "\033[1m";
static const char* DIM    = "\033[2m";

static void printHeader() {
    std::cout << "\n"
              << CYAN << BOLD
              << "  ██████╗██╗   ██╗██████╗ ███████╗██████╗ ███████╗ ██████╗ ██████╗  ██████╗ ███████╗\n"
              << "  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝\n"
              << "  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  \n"
              << "  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  \n"
              << "  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗\n"
              << "   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝\n"
              << RESET
              << PURPLE << "  Product Catalog Manager v1.0  |  CyberForge PC\n" << RESET
              << "\n";
}

static void printSeparator() {
    std::cout << DIM << "  " << std::string(76, '-') << RESET << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────────

static void printProductRow(const Product& p, bool showType = false) {
    std::string avail = p.inStock ? "In Stock" : "Made to Order";
    std::string avColor = p.inStock ? GREEN : YELLOW;
    std::string badge = p.badge.empty() ? "      " : "[" + p.badge + "]";

    std::cout << "  " << CYAN << BOLD << std::left << std::setw(12) << p.id << RESET
              << std::left << std::setw(26) << p.name;
    if (showType)
        std::cout << DIM << std::left << std::setw(8) << p.type << RESET;
    std::cout << YELLOW << std::setw(9) << ("$" + std::to_string((int)p.price))
              << RESET << " "
              << avColor << std::setw(18) << avail << RESET
              << PURPLE << badge << RESET
              << "\n";
}

static void printProductDetail(const Product& p) {
    printSeparator();
    std::cout << "\n"
              << "  " << CYAN << BOLD << p.name << RESET
              << "  " << DIM << "(" << p.id << ")" << RESET << "\n"
              << "  " << DIM << p.description << RESET << "\n\n";

    std::cout << "  " << BOLD << "Brand:      " << RESET << p.brand << "\n"
              << "  " << BOLD << "Type:       " << RESET << p.type << "\n"
              << "  " << BOLD << "Price:      " << RESET
              << YELLOW << "$" << std::fixed << std::setprecision(2) << p.price << RESET;
    if (p.oldPrice > 0)
        std::cout << DIM << "  (was $" << std::setprecision(2) << p.oldPrice << ")" << RESET;
    std::cout << "\n";

    std::string avail = p.inStock ? "In Stock" : "Made to Order";
    std::string avColor = p.inStock ? "\033[92m" : "\033[93m";
    std::cout << "  " << BOLD << "Stock:      " << RESET
              << avColor << avail << RESET << "\n"
              << "  " << BOLD << "Rating:     " << RESET
              << GREEN << p.rating << " / 5.0" << RESET
              << DIM << "  (" << p.reviews << " reviews)" << RESET << "\n\n";

    std::cout << "  " << BOLD << "Specifications:\n" << RESET;
    for (const auto& s : p.specs) {
        std::cout << "    " << DIM << std::left << std::setw(18) << s.key << RESET
                  << s.value << "\n";
    }
    std::cout << "\n";
    printSeparator();
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON export
// ─────────────────────────────────────────────────────────────────────────────

static std::string jsonEscape(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"')  out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else out += c;
    }
    return out;
}

static void exportToJson(const std::vector<Product>& catalog, const std::string& filename) {
    std::ofstream f(filename);
    if (!f.is_open()) {
        std::cerr << "  ERROR: Cannot write to " << filename << "\n";
        return;
    }

    auto writeProduct = [&](const Product& p) {
        f << "    {\n"
          << "      \"id\": \""          << jsonEscape(p.id)   << "\",\n"
          << "      \"type\": \""        << jsonEscape(p.type) << "\",\n"
          << "      \"name\": \""        << jsonEscape(p.name) << "\",\n"
          << "      \"brand\": \""       << jsonEscape(p.brand) << "\",\n"
          << "      \"price\": "         << std::fixed << std::setprecision(2) << p.price << ",\n"
          << "      \"oldPrice\": "      << (p.oldPrice > 0 ? p.oldPrice : 0.0) << ",\n"
          << "      \"badge\": \""       << jsonEscape(p.badge) << "\",\n"
          << "      \"description\": \"" << jsonEscape(p.description) << "\",\n"
          << "      \"rating\": "        << p.rating << ",\n"
          << "      \"reviews\": "       << p.reviews << ",\n"
          << "      \"inStock\": "       << (p.inStock ? "true" : "false") << ",\n"
          << "      \"specs\": {\n";
        for (std::size_t i = 0; i < p.specs.size(); ++i) {
            f << "        \"" << jsonEscape(p.specs[i].key) << "\": \""
              << jsonEscape(p.specs[i].value) << "\"";
            if (i + 1 < p.specs.size()) f << ",";
            f << "\n";
        }
        f << "      }\n"
          << "    }";
    };

    f << "{\n  \"pcs\": [\n";
    std::vector<Product> pcs, cases;
    for (const auto& p : catalog) (p.type == "pc" ? pcs : cases).push_back(p);
    for (std::size_t i = 0; i < pcs.size(); ++i) {
        writeProduct(pcs[i]);
        if (i + 1 < pcs.size()) f << ",";
        f << "\n";
    }
    f << "  ],\n  \"cases\": [\n";
    for (std::size_t i = 0; i < cases.size(); ++i) {
        writeProduct(cases[i]);
        if (i + 1 < cases.size()) f << ",";
        f << "\n";
    }
    f << "  ]\n}\n";
    f.close();

    std::cout << "  " << GREEN << "Exported " << catalog.size()
              << " products to " << filename << RESET << "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

static void printReport(const std::vector<Product>& catalog) {
    double totalRevPotential = 0.0;
    double minPrice = 1e9, maxPrice = 0.0;
    int inStock = 0;
    std::map<std::string, int> brandCount;
    std::map<std::string, double> typeRevenue;

    for (const auto& p : catalog) {
        totalRevPotential += p.price;
        if (p.price < minPrice) minPrice = p.price;
        if (p.price > maxPrice) maxPrice = p.price;
        if (p.inStock) ++inStock;
        brandCount[p.brand]++;
        typeRevenue[p.type] += p.price;
    }
    double avg = catalog.empty() ? 0 : totalRevPotential / catalog.size();

    printSeparator();
    std::cout << "\n  " << BOLD << CYAN << "PRICING REPORT" << RESET << "\n\n"
              << "  Total Products:       " << catalog.size() << "\n"
              << "  In Stock:             " << inStock << " / " << catalog.size() << "\n"
              << "  Lowest Price:         " << YELLOW << "$"
              << std::fixed << std::setprecision(2) << minPrice << RESET << "\n"
              << "  Highest Price:        " << YELLOW << "$" << maxPrice << RESET << "\n"
              << "  Average Price:        " << YELLOW << "$" << avg << RESET << "\n\n";

    std::cout << "  By Type:\n";
    for (const auto& kv : typeRevenue) {
        double cnt = std::count_if(catalog.begin(), catalog.end(),
            [&](const Product& p){ return p.type == kv.first; });
        std::cout << "    " << std::left << std::setw(10) << kv.first
                  << DIM << " " << (int)cnt << " products  |  avg $"
                  << std::setprecision(2) << kv.second / cnt << RESET << "\n";
    }

    std::cout << "\n  By Brand:\n";
    for (const auto& kv : brandCount) {
        std::cout << "    " << std::left << std::setw(20) << kv.first
                  << DIM << kv.second << " product(s)" << RESET << "\n";
    }

    std::cout << "\n";
    printSeparator();
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive menu
// ─────────────────────────────────────────────────────────────────────────────

static void interactiveMenu(std::vector<Product>& catalog) {
    while (true) {
        std::cout << "\n  " << BOLD << "Main Menu\n" << RESET
                  << DIM
                  << "  [1] List all products\n"
                  << "  [2] List PCs only\n"
                  << "  [3] List Cases only\n"
                  << "  [4] Search by product ID\n"
                  << "  [5] Filter by max price\n"
                  << "  [6] Export catalog to JSON\n"
                  << "  [7] Pricing report\n"
                  << "  [0] Exit\n"
                  << RESET
                  << "\n  Choose an option: ";

        std::string choice;
        std::getline(std::cin, choice);

        if (choice == "0") {
            std::cout << "\n  " << GREEN << "Goodbye!" << RESET << "\n\n";
            break;
        } else if (choice == "1") {
            std::cout << "\n  " << BOLD << "All Products\n" << RESET;
            printSeparator();
            for (const auto& p : catalog) printProductRow(p, true);

        } else if (choice == "2") {
            std::cout << "\n  " << BOLD << "PCs\n" << RESET;
            printSeparator();
            for (const auto& p : catalog)
                if (p.type == "pc") printProductRow(p);

        } else if (choice == "3") {
            std::cout << "\n  " << BOLD << "PC Cases\n" << RESET;
            printSeparator();
            for (const auto& p : catalog)
                if (p.type == "case") printProductRow(p);

        } else if (choice == "4") {
            std::cout << "  Enter product ID: ";
            std::string id; std::getline(std::cin, id);
            auto it = std::find_if(catalog.begin(), catalog.end(),
                [&](const Product& p){ return p.id == id; });
            if (it == catalog.end())
                std::cout << "  " << YELLOW << "Product not found." << RESET << "\n";
            else
                printProductDetail(*it);

        } else if (choice == "5") {
            std::cout << "  Max price ($): ";
            std::string s; std::getline(std::cin, s);
            double maxP = 0;
            try { maxP = std::stod(s); } catch (...) { continue; }
            std::cout << "\n  " << BOLD << "Products under $" << (int)maxP << "\n" << RESET;
            printSeparator();
            bool found = false;
            for (const auto& p : catalog)
                if (p.price <= maxP) { printProductRow(p, true); found = true; }
            if (!found)
                std::cout << "  " << DIM << "No products in that price range.\n" << RESET;

        } else if (choice == "6") {
            exportToJson(catalog, "catalog.json");

        } else if (choice == "7") {
            printReport(catalog);

        } else {
            std::cout << "  " << YELLOW << "Invalid choice. Try again.\n" << RESET;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// main()
// ─────────────────────────────────────────────────────────────────────────────

int main(int argc, char* argv[]) {
    auto catalog = buildCatalog();

    // Non-interactive modes via command-line flags
    if (argc >= 2) {
        std::string flag = argv[1];

        if (flag == "--list") {
            std::string type = (argc >= 3) ? argv[2] : "all";
            printHeader();
            for (const auto& p : catalog) {
                if (type == "all" || p.type == type)
                    printProductRow(p, type == "all");
            }
            return 0;
        }
        if (flag == "--detail" && argc >= 3) {
            std::string id = argv[2];
            auto it = std::find_if(catalog.begin(), catalog.end(),
                [&](const Product& p){ return p.id == id; });
            if (it == catalog.end()) {
                std::cerr << "Product not found: " << id << "\n";
                return 1;
            }
            printHeader();
            printProductDetail(*it);
            return 0;
        }
        if (flag == "--export") {
            std::string fname = (argc >= 3) ? argv[2] : "catalog.json";
            exportToJson(catalog, fname);
            return 0;
        }
        if (flag == "--report") {
            printHeader();
            printReport(catalog);
            return 0;
        }
        std::cerr << "Unknown flag: " << flag << "\n"
                  << "Usage: ./product_catalog [--list [pcs|cases]] [--detail <id>] [--export [file]] [--report]\n";
        return 1;
    }

    // Interactive mode
    printHeader();
    interactiveMenu(catalog);
    return 0;
}
