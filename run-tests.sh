#!/bin/bash

# FinTech ESCROW - Test Execution Script
# This script runs all tests with proper setup and teardown

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install npm dependencies
    npm install
    
    # Install Playwright browsers
    npm run test:install
    
    print_success "Dependencies installed"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start backend services
    cd backend
    docker-compose up -d
    cd ..
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if ! curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_error "Backend services are not ready. Please check Docker containers."
        exit 1
    fi
    
    print_success "Services started successfully"
}

# Function to run tests
run_tests() {
    local test_type="$1"
    local test_args="$2"
    
    print_status "Running $test_type tests..."
    
    case $test_type in
        "e2e")
            npm run test $test_args
            ;;
        "api")
            npm run test:api $test_args
            ;;
        "integration")
            npm run test:integration $test_args
            ;;
        "load")
            npm run test:load $test_args
            ;;
        "stress")
            npm run test:stress $test_args
            ;;
        "spike")
            npm run test:spike $test_args
            ;;
        "volume")
            npm run test:volume $test_args
            ;;
        "all")
            npm run test:all $test_args
            ;;
        "smoke")
            npm run test:smoke $test_args
            ;;
        "regression")
            npm run test:regression $test_args
            ;;
        "performance")
            npm run test:performance $test_args
            ;;
        "security")
            npm run test:security $test_args
            ;;
        "mobile")
            npm run test:mobile $test_args
            ;;
        *)
            print_error "Unknown test type: $test_type"
            print_status "Available test types: e2e, api, integration, load, stress, spike, volume, all, smoke, regression, performance, security, mobile"
            exit 1
            ;;
    esac
    
    print_success "$test_type tests completed"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    # Stop backend services
    cd backend
    docker-compose down
    cd ..
    
    print_success "Services stopped"
}

# Function to generate reports
generate_reports() {
    print_status "Generating reports..."
    
    # Generate Playwright report
    if [ -d "playwright-report" ]; then
        print_status "Playwright report available at: playwright-report/index.html"
    fi
    
    # Generate Allure report
    if [ -d "allure-results" ]; then
        print_status "Allure results available at: allure-results/"
    fi
    
    # Generate coverage report
    if [ -d "coverage" ]; then
        print_status "Coverage report available at: coverage/index.html"
    fi
    
    print_success "Reports generated"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop services
    stop_services
    
    # Clean up test results
    rm -rf test-results/
    rm -rf playwright-report/
    rm -rf allure-results/
    rm -rf coverage/
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "FinTech ESCROW - Test Execution Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_TYPE] [TEST_ARGS]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help          Show this help message"
    echo "  -s, --setup-only    Only setup environment (install deps, start services)"
    echo "  -c, --cleanup-only  Only cleanup environment (stop services, clean files)"
    echo "  -r, --reports-only  Only generate reports"
    echo "  -f, --full          Run full test suite with setup and cleanup"
    echo ""
    echo "TEST_TYPES:"
    echo "  e2e                 End-to-end tests with Playwright"
    echo "  api                 API tests with Jest"
    echo "  integration         Integration tests"
    echo "  load                Load tests with Artillery"
    echo "  stress              Stress tests with Artillery"
    echo "  spike               Spike tests with Artillery"
    echo "  volume              Volume tests with Artillery"
    echo "  all                 All tests (e2e + api + integration)"
    echo "  smoke               Smoke tests only"
    echo "  regression          Regression tests only"
    echo "  performance         Performance tests only"
    echo "  security            Security tests only"
    echo "  mobile              Mobile tests only"
    echo ""
    echo "TEST_ARGS:"
    echo "  Any additional arguments to pass to the test runner"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 e2e                    # Run e2e tests"
    echo "  $0 e2e --headed           # Run e2e tests in headed mode"
    echo "  $0 api --verbose          # Run API tests with verbose output"
    echo "  $0 load --workers 4       # Run load tests with 4 workers"
    echo "  $0 -f all                 # Run full test suite"
    echo "  $0 -s                     # Setup environment only"
    echo "  $0 -c                     # Cleanup environment only"
    echo "  $0 -r                     # Generate reports only"
}

# Main function
main() {
    local setup_only=false
    local cleanup_only=false
    local reports_only=false
    local full_suite=false
    local test_type=""
    local test_args=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--setup-only)
                setup_only=true
                shift
                ;;
            -c|--cleanup-only)
                cleanup_only=true
                shift
                ;;
            -r|--reports-only)
                reports_only=true
                shift
                ;;
            -f|--full)
                full_suite=true
                shift
                ;;
            *)
                if [ -z "$test_type" ]; then
                    test_type="$1"
                else
                    test_args="$test_args $1"
                fi
                shift
                ;;
        esac
    done
    
    # Handle special cases
    if [ "$setup_only" = true ]; then
        check_prerequisites
        install_dependencies
        start_services
        print_success "Setup completed successfully"
        exit 0
    fi
    
    if [ "$cleanup_only" = true ]; then
        cleanup
        exit 0
    fi
    
    if [ "$reports_only" = true ]; then
        generate_reports
        exit 0
    fi
    
    # Default to e2e tests if no test type specified
    if [ -z "$test_type" ]; then
        test_type="e2e"
    fi
    
    # Run full suite if requested
    if [ "$full_suite" = true ]; then
        test_type="all"
    fi
    
    # Main execution flow
    print_status "Starting FinTech ESCROW test execution..."
    print_status "Test type: $test_type"
    print_status "Test args: $test_args"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Start services
    start_services
    
    # Run tests
    run_tests "$test_type" "$test_args"
    
    # Generate reports
    generate_reports
    
    # Cleanup
    cleanup
    
    print_success "Test execution completed successfully!"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
