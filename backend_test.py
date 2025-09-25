#!/usr/bin/env python3
"""
Advanced Portfolio & Project Management System - Backend API Testing
Phase 4 Features Testing: PDF Export, Enhanced Search, Advanced Analytics
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class AdvancedPortfolioAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.current_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Demo credentials from DEMO_CREDENTIALS.md
        self.demo_credentials = {
            "email": "demo@portfolio.com",
            "password": "demo123"
        }
        
        print(f"🚀 Advanced Portfolio API Tester")
        print(f"📍 Testing against: {self.base_url}")
        print(f"🔐 Using demo credentials: {self.demo_credentials['email']}")
        print("=" * 60)

    def log_test_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results for reporting"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    📝 {details}")
        if not success and response_data:
            print(f"    🔍 Response: {response_data}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    expected_status: int = 200, headers: Dict = None) -> tuple:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        request_headers = {'Content-Type': 'application/json'}
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            request_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text[:200]}
            
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test API health endpoint"""
        success, response = self.make_request('GET', 'health')
        
        if success and response.get('status') == 'healthy':
            self.log_test_result(
                "Health Check", 
                True, 
                f"API is healthy: {response.get('message', '')}"
            )
            return True
        else:
            self.log_test_result(
                "Health Check", 
                False, 
                "API health check failed", 
                response
            )
            return False

    def test_authentication(self):
        """Test authentication with demo credentials"""
        success, response = self.make_request(
            'POST', 
            'auth/login', 
            self.demo_credentials
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.current_user = response.get('user', {})
            self.log_test_result(
                "Authentication - Demo Login", 
                True, 
                f"Successfully logged in as {self.current_user.get('name', 'Unknown')}"
            )
            return True
        else:
            self.log_test_result(
                "Authentication - Demo Login", 
                False, 
                "Failed to authenticate with demo credentials", 
                response
            )
            return False

    def test_enhanced_analytics_dashboard(self):
        """Test enhanced analytics dashboard with monthly activity"""
        success, response = self.make_request('GET', 'analytics/dashboard')
        
        if success:
            # Check for required analytics fields
            required_fields = ['projects', 'tasks', 'project_types', 'monthly_activity']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                # Check projects analytics
                projects = response.get('projects', {})
                has_project_metrics = all(key in projects for key in ['total', 'completed', 'in_progress', 'completion_rate'])
                
                # Check tasks analytics  
                tasks = response.get('tasks', {})
                has_task_metrics = all(key in tasks for key in ['total', 'completed', 'completion_rate'])
                
                # Check monthly activity (Phase 4 feature)
                monthly_activity = response.get('monthly_activity', [])
                has_monthly_data = isinstance(monthly_activity, list)
                
                if has_project_metrics and has_task_metrics and has_monthly_data:
                    self.log_test_result(
                        "Enhanced Analytics Dashboard", 
                        True, 
                        f"Analytics loaded: {projects['total']} projects, {tasks['total']} tasks, {len(monthly_activity)} months of activity data"
                    )
                    return True
                else:
                    self.log_test_result(
                        "Enhanced Analytics Dashboard", 
                        False, 
                        "Missing required analytics metrics", 
                        response
                    )
                    return False
            else:
                self.log_test_result(
                    "Enhanced Analytics Dashboard", 
                    False, 
                    f"Missing required fields: {missing_fields}", 
                    response
                )
                return False
        else:
            self.log_test_result(
                "Enhanced Analytics Dashboard", 
                False, 
                "Failed to fetch analytics dashboard", 
                response
            )
            return False

    def test_enhanced_search_functionality(self):
        """Test enhanced search across projects, tasks, and users"""
        # Test search with different parameters
        search_tests = [
            {"query": "test", "type": "all", "description": "Search all content types"},
            {"query": "project", "type": "projects", "description": "Search projects only"},
            {"query": "task", "type": "tasks", "description": "Search tasks only"},
            {"query": "user", "type": "users", "description": "Search users only"},
        ]
        
        all_passed = True
        
        for test_case in search_tests:
            params = f"?query={test_case['query']}&type={test_case['type']}&limit=10"
            success, response = self.make_request('GET', f'search{params}')
            
            if success:
                # Check response structure
                required_fields = ['projects', 'tasks', 'users', 'total']
                has_all_fields = all(field in response for field in required_fields)
                
                if has_all_fields:
                    total_results = response.get('total', 0)
                    self.log_test_result(
                        f"Enhanced Search - {test_case['description']}", 
                        True, 
                        f"Search returned {total_results} results"
                    )
                else:
                    self.log_test_result(
                        f"Enhanced Search - {test_case['description']}", 
                        False, 
                        f"Missing required response fields: {required_fields}", 
                        response
                    )
                    all_passed = False
            else:
                self.log_test_result(
                    f"Enhanced Search - {test_case['description']}", 
                    False, 
                    "Search request failed", 
                    response
                )
                all_passed = False
        
        return all_passed

    def test_pdf_export_functionality(self):
        """Test PDF export functionality for portfolio and projects"""
        if not self.current_user:
            self.log_test_result(
                "PDF Export - Prerequisites", 
                False, 
                "No authenticated user for PDF export testing"
            )
            return False
        
        user_id = self.current_user.get('id')
        if not user_id:
            self.log_test_result(
                "PDF Export - Prerequisites", 
                False, 
                "User ID not available for PDF export testing"
            )
            return False
        
        # Test portfolio export
        portfolio_export_data = {
            "user_id": user_id,
            "export_type": "portfolio",
            "include_projects": True,
            "include_tasks": False
        }
        
        success, response = self.make_request('POST', 'export/pdf', portfolio_export_data)
        
        portfolio_success = False
        if success and 'filename' in response and 'download_url' in response:
            filename = response['filename']
            self.log_test_result(
                "PDF Export - Portfolio", 
                True, 
                f"Portfolio PDF generated: {filename}"
            )
            portfolio_success = True
            
            # Test download endpoint
            download_success, download_response = self.make_request(
                'GET', 
                f'export/download/{filename}',
                expected_status=200
            )
            
            if download_success:
                self.log_test_result(
                    "PDF Export - Portfolio Download", 
                    True, 
                    f"Portfolio PDF download successful"
                )
            else:
                self.log_test_result(
                    "PDF Export - Portfolio Download", 
                    False, 
                    "Failed to download portfolio PDF", 
                    download_response
                )
        else:
            self.log_test_result(
                "PDF Export - Portfolio", 
                False, 
                "Portfolio PDF export failed", 
                response
            )
        
        # Test projects export
        projects_export_data = {
            "user_id": user_id,
            "export_type": "projects",
            "include_projects": True,
            "include_tasks": True
        }
        
        success, response = self.make_request('POST', 'export/pdf', projects_export_data)
        
        projects_success = False
        if success and 'filename' in response and 'download_url' in response:
            filename = response['filename']
            self.log_test_result(
                "PDF Export - Projects", 
                True, 
                f"Projects PDF generated: {filename}"
            )
            projects_success = True
            
            # Test download endpoint
            download_success, download_response = self.make_request(
                'GET', 
                f'export/download/{filename}',
                expected_status=200
            )
            
            if download_success:
                self.log_test_result(
                    "PDF Export - Projects Download", 
                    True, 
                    f"Projects PDF download successful"
                )
            else:
                self.log_test_result(
                    "PDF Export - Projects Download", 
                    False, 
                    "Failed to download projects PDF", 
                    download_response
                )
        else:
            self.log_test_result(
                "PDF Export - Projects", 
                False, 
                "Projects PDF export failed", 
                response
            )
        
        return portfolio_success and projects_success

    def test_project_management_apis(self):
        """Test basic project management functionality"""
        # Create a test project
        test_project = {
            "title": "Test Project for Phase 4",
            "description": "Testing Phase 4 advanced features",
            "technologies": ["React", "FastAPI", "MongoDB"],
            "status": "in-progress",
            "project_type": "software",
            "priority": "high",
            "tags": ["testing", "phase4"]
        }
        
        success, response = self.make_request('POST', 'projects', test_project, 201)
        
        if success and 'id' in response:
            project_id = response['id']
            self.log_test_result(
                "Project Management - Create Project", 
                True, 
                f"Test project created with ID: {project_id}"
            )
            
            # Test getting projects (should include our new project)
            success, response = self.make_request('GET', 'projects')
            
            if success and isinstance(response, list):
                self.log_test_result(
                    "Project Management - Get Projects", 
                    True, 
                    f"Retrieved {len(response)} projects"
                )
                return True
            else:
                self.log_test_result(
                    "Project Management - Get Projects", 
                    False, 
                    "Failed to retrieve projects", 
                    response
                )
                return False
        else:
            self.log_test_result(
                "Project Management - Create Project", 
                False, 
                "Failed to create test project", 
                response
            )
            return False

    def run_comprehensive_test_suite(self):
        """Run all Phase 4 feature tests"""
        print("🧪 Starting Comprehensive Phase 4 Feature Testing")
        print("=" * 60)
        
        # Test sequence
        test_sequence = [
            ("API Health Check", self.test_health_check),
            ("Authentication System", self.test_authentication),
            ("Enhanced Analytics Dashboard", self.test_enhanced_analytics_dashboard),
            ("Enhanced Search Functionality", self.test_enhanced_search_functionality),
            ("PDF Export Functionality", self.test_pdf_export_functionality),
            ("Project Management APIs", self.test_project_management_apis),
        ]
        
        for test_name, test_function in test_sequence:
            print(f"🔍 Running: {test_name}")
            try:
                test_function()
            except Exception as e:
                self.log_test_result(
                    test_name, 
                    False, 
                    f"Test failed with exception: {str(e)}"
                )
            print("-" * 40)
        
        # Print final results
        self.print_test_summary()
        
        return self.tests_passed == self.tests_run

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 PHASE 4 TESTING SUMMARY")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"⏱️  Total Tests: {self.tests_run}")
        
        # Group results by category
        categories = {}
        for result in self.test_results:
            category = result['test_name'].split(' - ')[0]
            if category not in categories:
                categories[category] = {'passed': 0, 'failed': 0}
            
            if result['success']:
                categories[category]['passed'] += 1
            else:
                categories[category]['failed'] += 1
        
        print("\n📋 Results by Category:")
        for category, stats in categories.items():
            total = stats['passed'] + stats['failed']
            rate = (stats['passed'] / total * 100) if total > 0 else 0
            print(f"  {category}: {stats['passed']}/{total} ({rate:.1f}%)")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  • {test['test_name']}: {test['details']}")
        
        print("\n" + "=" * 60)
        
        if success_rate >= 80:
            print("🎉 PHASE 4 TESTING: EXCELLENT RESULTS!")
        elif success_rate >= 60:
            print("⚠️  PHASE 4 TESTING: GOOD RESULTS WITH SOME ISSUES")
        else:
            print("🚨 PHASE 4 TESTING: SIGNIFICANT ISSUES FOUND")
        
        print("=" * 60)

def main():
    """Main test execution"""
    print("🚀 Advanced Portfolio & Project Management System")
    print("📋 Phase 4 Features Backend API Testing")
    print("🔧 Testing: PDF Export, Enhanced Search, Advanced Analytics")
    print()
    
    # Initialize tester
    tester = AdvancedPortfolioAPITester()
    
    # Run comprehensive test suite
    success = tester.run_comprehensive_test_suite()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())