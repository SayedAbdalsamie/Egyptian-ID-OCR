#!/usr/bin/env python3
"""
Unified startup script for Egyptian ID OCR application.
Starts both Flask backend and Vite frontend development servers.
"""

import os
import sys
import subprocess
import time
import signal
import platform
from pathlib import Path

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_colored(message, color=Colors.RESET):
    """Print colored message."""
    print(f"{color}{message}{Colors.RESET}")

def check_dependencies():
    """Check if required dependencies are installed."""
    print_colored("Checking dependencies...", Colors.BLUE)
    
    # Check Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print_colored("Error: Python 3.8+ is required", Colors.RED)
        return False
    
    # Check if Flask is installed
    try:
        import flask
    except ImportError:
        print_colored("Error: Flask not found. Please run: pip install -r requirements.txt", Colors.RED)
        return False
    
    # Check if Node.js is installed
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, check=True)
        print_colored(f"Node.js version: {result.stdout.strip()}", Colors.GREEN)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_colored("Error: Node.js not found. Please install Node.js from https://nodejs.org/", Colors.RED)
        return False
    
    # Check if npm is installed
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, check=True)
        print_colored(f"npm version: {result.stdout.strip()}", Colors.GREEN)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_colored("Error: npm not found. Please install npm", Colors.RED)
        return False
    
    return True

def install_frontend_dependencies():
    """Install frontend dependencies if needed."""
    frontend_dir = Path("frontend")
    node_modules = frontend_dir / "node_modules"
    
    if not node_modules.exists():
        print_colored("Installing frontend dependencies...", Colors.YELLOW)
        try:
            subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
            print_colored("Frontend dependencies installed successfully!", Colors.GREEN)
        except subprocess.CalledProcessError:
            print_colored("Error: Failed to install frontend dependencies", Colors.RED)
            return False
    else:
        print_colored("Frontend dependencies already installed", Colors.GREEN)
    
    return True

def start_backend():
    """Start Flask backend server."""
    print_colored("\n" + "="*60, Colors.BOLD)
    print_colored("Starting Flask Backend Server...", Colors.BOLD + Colors.BLUE)
    print_colored("="*60, Colors.BOLD)
    
    # Set environment variables
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'
    
    # Start Flask server
    backend_process = subprocess.Popen(
        [sys.executable, 'app.py'],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    return backend_process

def start_frontend():
    """Start Vite frontend development server."""
    print_colored("\n" + "="*60, Colors.BOLD)
    print_colored("Starting Vite Frontend Server...", Colors.BOLD + Colors.BLUE)
    print_colored("="*60, Colors.BOLD)
    
    frontend_dir = Path("frontend")
    
    # Start Vite dev server
    frontend_process = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    return frontend_process

def print_output(process, name, color):
    """Print output from a subprocess."""
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print_colored(f"[{name}] {line.rstrip()}", color)
    except Exception:
        pass

def main():
    """Main function to start both servers."""
    print_colored("\n" + "="*60, Colors.BOLD + Colors.GREEN)
    print_colored("  Egyptian ID OCR - Unified Startup Script", Colors.BOLD + Colors.GREEN)
    print_colored("="*60, Colors.BOLD + Colors.GREEN)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install frontend dependencies if needed
    if not install_frontend_dependencies():
        sys.exit(1)
    
    # Ensure static directories exist
    os.makedirs("static/uploads", exist_ok=True)
    os.makedirs("static/crops", exist_ok=True)
    
    # Start backend
    backend_process = start_backend()
    
    # Give backend a moment to start
    time.sleep(2)
    
    # Start frontend
    frontend_process = start_frontend()
    
    # Give frontend a moment to start
    time.sleep(2)
    
    # Print startup info
    print_colored("\n" + "="*60, Colors.BOLD + Colors.GREEN)
    print_colored("  Servers Started Successfully!", Colors.BOLD + Colors.GREEN)
    print_colored("="*60, Colors.BOLD + Colors.GREEN)
    print_colored("\nBackend API:  http://localhost:8000", Colors.BLUE)
    print_colored("Frontend App: http://localhost:3000", Colors.BLUE)
    print_colored("\nPress Ctrl+C to stop both servers", Colors.YELLOW)
    print_colored("="*60 + "\n", Colors.BOLD)
    
    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print_colored("\n\nShutting down servers...", Colors.YELLOW)
        backend_process.terminate()
        frontend_process.terminate()
        
        # Wait for processes to terminate
        try:
            backend_process.wait(timeout=5)
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
            frontend_process.kill()
        
        print_colored("Servers stopped.", Colors.GREEN)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Monitor processes and print output
    try:
        import threading
        
        def monitor_backend():
            print_output(backend_process, "BACKEND", Colors.BLUE)
        
        def monitor_frontend():
            print_output(frontend_process, "FRONTEND", Colors.GREEN)
        
        backend_thread = threading.Thread(target=monitor_backend, daemon=True)
        frontend_thread = threading.Thread(target=monitor_frontend, daemon=True)
        
        backend_thread.start()
        frontend_thread.start()
        
        # Wait for processes
        while True:
            if backend_process.poll() is not None:
                print_colored("\nBackend process exited!", Colors.RED)
                frontend_process.terminate()
                break
            if frontend_process.poll() is not None:
                print_colored("\nFrontend process exited!", Colors.RED)
                backend_process.terminate()
                break
            time.sleep(1)
    
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()

