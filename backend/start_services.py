#!/usr/bin/env python3
"""
Script to start all microservices for development
"""
import subprocess
import sys
import time
import os
from pathlib import Path

def start_service(service_name, port, cwd):
    """Start a microservice"""
    print(f"Starting {service_name} on port {port}...")
    try:
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port), "--reload"],
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return process
    except Exception as e:
        print(f"Failed to start {service_name}: {e}")
        return None

def main():
    """Main function to start all services"""
    base_dir = Path(__file__).parent
    
    services = [
        ("Auth Service", 8001, base_dir / "auth_service"),
        ("ESCROW Service", 8002, base_dir / "escrow_service"),
        ("Payment Service", 8003, base_dir / "payment_service"),
        ("Notification Service", 8004, base_dir / "notification_service"),
    ]
    
    processes = []
    
    print("🚀 Starting FinTech ESCROW Microservices...")
    print("=" * 50)
    
    # Start all services
    for service_name, port, cwd in services:
        if not cwd.exists():
            print(f"❌ Directory {cwd} does not exist. Skipping {service_name}.")
            continue
            
        process = start_service(service_name, port, cwd)
        if process:
            processes.append((service_name, process))
            print(f"✅ {service_name} started on port {port}")
        else:
            print(f"❌ Failed to start {service_name}")
    
    print("=" * 50)
    print("🎉 All services started!")
    print("\nService URLs:")
    for service_name, _ in processes:
        if "Auth" in service_name:
            print(f"  🔐 {service_name}: http://localhost:8001")
        elif "ESCROW" in service_name:
            print(f"  💰 {service_name}: http://localhost:8002")
        elif "Payment" in service_name:
            print(f"  💳 {service_name}: http://localhost:8003")
        elif "Notification" in service_name:
            print(f"  📧 {service_name}: http://localhost:8004")
    
    print("\n📚 API Documentation:")
    print("  🔐 Auth API: http://localhost:8001/docs")
    print("  💰 ESCROW API: http://localhost:8002/docs")
    print("  💳 Payment API: http://localhost:8003/docs")
    print("  📧 Notification API: http://localhost:8004/docs")
    
    print("\n🛑 Press Ctrl+C to stop all services")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping all services...")
        for service_name, process in processes:
            print(f"Stopping {service_name}...")
            process.terminate()
            process.wait()
        print("✅ All services stopped.")

if __name__ == "__main__":
    main()
