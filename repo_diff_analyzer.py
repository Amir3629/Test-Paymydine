#!/usr/bin/env python3
"""
Repository Diff Analyzer
Compares two repositories and generates a comprehensive diff report.
"""

import os
import hashlib
import csv
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set

class RepoDiffAnalyzer:
    def __init__(self, amir_path: str, server_path: str):
        self.amir_path = Path(amir_path)
        self.server_path = Path(server_path)
        
        # Exclude patterns
        self.exclude_patterns = {
            '.git', 'node_modules', '.next', 'dist', 'build', 'storage', 
            'vendor', '.env*', '__pycache__', '.DS_Store', '*.log',
            '*.tmp', '*.cache', '.vscode', '.idea', 'coverage'
        }
        
        self.diff_results = []
        
    def should_exclude(self, path: Path) -> bool:
        """Check if a path should be excluded from comparison."""
        path_str = str(path)
        for pattern in self.exclude_patterns:
            if pattern in path_str or path.name.startswith('.') and pattern.startswith('.'):
                return True
        return False
    
    def get_file_hash(self, file_path: Path) -> str:
        """Calculate SHA1 hash of a file."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.sha1(f.read()).hexdigest()
        except (IOError, OSError):
            return ""
    
    def scan_directory(self, base_path: Path, relative_to: Path) -> Dict[str, str]:
        """Scan directory and return file paths with their hashes."""
        files = {}
        
        if not base_path.exists():
            return files
            
        for root, dirs, filenames in os.walk(base_path):
            # Remove excluded directories from dirs to prevent walking into them
            dirs[:] = [d for d in dirs if not self.should_exclude(Path(root) / d)]
            
            for filename in filenames:
                file_path = Path(root) / filename
                
                if self.should_exclude(file_path):
                    continue
                    
                try:
                    relative_path = file_path.relative_to(relative_to)
                    file_hash = self.get_file_hash(file_path)
                    if file_hash:  # Only include files that could be read
                        files[str(relative_path)] = file_hash
                except ValueError:
                    # File is outside the relative path, skip
                    continue
                    
        return files
    
    def compare_repositories(self):
        """Compare the two repositories and generate diff results."""
        print("🔍 Scanning Amir's repository (amir-test/app/main/)...")
        amir_files = self.scan_directory(self.amir_path / "app" / "main", self.amir_path / "app" / "main")
        
        print("🔍 Scanning Server-Deployment repository...")
        server_files = self.scan_directory(self.server_path, self.server_path)
        
        print(f"📊 Found {len(amir_files)} files in Amir's repo")
        print(f"📊 Found {len(server_files)} files in Server-Deployment repo")
        
        # Find all unique file paths
        all_paths = set(amir_files.keys()) | set(server_files.keys())
        
        print(f"🔍 Comparing {len(all_paths)} unique file paths...")
        
        for file_path in sorted(all_paths):
            amir_hash = amir_files.get(file_path, "")
            server_hash = server_files.get(file_path, "")
            
            if amir_hash and server_hash:
                if amir_hash == server_hash:
                    # Files are identical, skip
                    continue
                else:
                    status = "CHANGED"
            elif amir_hash and not server_hash:
                status = "ONLY_IN_AMIR"
            elif not amir_hash and server_hash:
                status = "ONLY_IN_SERVER"
            else:
                # Both empty, shouldn't happen
                continue
                
            self.diff_results.append({
                'status': status,
                'file_path': file_path,
                'amir_hash': amir_hash[:8] if amir_hash else '',
                'server_hash': server_hash[:8] if server_hash else ''
            })
    
    def generate_csv_report(self, output_file: str = "repo_diff.csv"):
        """Generate CSV report of differences."""
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['status', 'file_path', 'amir_hash', 'server_hash']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for row in self.diff_results:
                writer.writerow(row)
        
        print(f"📄 CSV report generated: {output_file}")
    
    def generate_summary(self):
        """Generate human-readable summary."""
        changed = len([r for r in self.diff_results if r['status'] == 'CHANGED'])
        only_amir = len([r for r in self.diff_results if r['status'] == 'ONLY_IN_AMIR'])
        only_server = len([r for r in self.diff_results if r['status'] == 'ONLY_IN_SERVER'])
        
        print("\n" + "="*60)
        print("📋 REPOSITORY COMPARISON SUMMARY")
        print("="*60)
        print(f"🔄 Files changed: {changed}")
        print(f"➕ Files only in Amir's repo: {only_amir}")
        print(f"➖ Files only in Server-Deployment repo: {only_server}")
        print(f"📊 Total differences: {len(self.diff_results)}")
        print("="*60)
        
        return {
            'changed': changed,
            'only_amir': only_amir,
            'only_server': only_server,
            'total': len(self.diff_results)
        }
    
    def generate_detailed_report(self, output_file: str = "repo_diff_detailed.md"):
        """Generate detailed Markdown report."""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Repository Comparison Report\n\n")
            f.write(f"**Amir's Repository:** `amir-test/app/main/`\n")
            f.write(f"**Server-Deployment Repository:** `server-deploy/`\n\n")
            
            summary = self.generate_summary()
            
            f.write("## Summary\n\n")
            f.write(f"- **Files changed:** {summary['changed']}\n")
            f.write(f"- **Files only in Amir's repo:** {summary['only_amir']}\n")
            f.write(f"- **Files only in Server-Deployment repo:** {summary['only_server']}\n")
            f.write(f"- **Total differences:** {summary['total']}\n\n")
            
            # Group by status
            by_status = {}
            for result in self.diff_results:
                status = result['status']
                if status not in by_status:
                    by_status[status] = []
                by_status[status].append(result)
            
            for status, files in by_status.items():
                f.write(f"## {status.replace('_', ' ').title()}\n\n")
                f.write(f"**Count:** {len(files)}\n\n")
                f.write("| File Path | Amir Hash | Server Hash |\n")
                f.write("|-----------|-----------|-------------|\n")
                
                for file_info in files:
                    f.write(f"| `{file_info['file_path']}` | `{file_info['amir_hash']}` | `{file_info['server_hash']}` |\n")
                f.write("\n")
        
        print(f"📄 Detailed report generated: {output_file}")

def main():
    # Set up paths
    amir_path = "amir-test"
    server_path = "server-deploy"
    
    # Verify directories exist
    if not os.path.exists(amir_path):
        print(f"❌ Error: {amir_path} directory not found!")
        sys.exit(1)
    
    if not os.path.exists(server_path):
        print(f"❌ Error: {server_path} directory not found!")
        sys.exit(1)
    
    # Create analyzer and run comparison
    analyzer = RepoDiffAnalyzer(amir_path, server_path)
    
    print("🚀 Starting repository comparison...")
    analyzer.compare_repositories()
    
    # Generate reports
    analyzer.generate_csv_report()
    analyzer.generate_detailed_report()
    analyzer.generate_summary()
    
    print("\n✅ Repository comparison completed successfully!")

if __name__ == "__main__":
    main()