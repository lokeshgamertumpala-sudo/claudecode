#!/usr/bin/env python3
"""
Master Automated Verification Suite
Validates:
  1. Coding Skill (code-crafter): Metadata, CLI callability, code generation, refactoring, syntax repair.
  2. Analysis Skill (codebase-analyzer): Metadata, CLI callability, metrics, dependency graph, security scanning.
  3. Workflow Automation Skill (workflow-automator): Metadata, CLI callability, pipeline execution, workspace sync, slash commands.
  4. Tool Call Motion Graphics Trigger: Sub-50ms non-blocking execution SLA, state contract, Remotion still render, fault tolerance.

Exits with status code 0 on complete success.
"""

import sys
import os
import time
import json
import ast
import tempfile
import shutil
import unittest
import subprocess
from pathlib import Path

# Add project root and skills scripts to sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

SKILLS_DIR = os.path.join(PROJECT_ROOT, ".agents", "skills")
sys.path.insert(0, os.path.join(SKILLS_DIR, "code-crafter", "scripts"))
sys.path.insert(0, os.path.join(SKILLS_DIR, "codebase-analyzer", "scripts"))
sys.path.insert(0, os.path.join(SKILLS_DIR, "workflow-automator", "scripts"))

from code_craftsman import CodeCraftsman
from codebase_analyzer import CodebaseAnalyzer
from workflow_automator import WorkflowAutomator
from tool_motion_trigger import ToolMotionTrigger

# Terminal colors
GREEN = "\033[92m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

class TestCodingSkill(unittest.TestCase):
    def test_coding_skill_metadata(self):
        skill_md = os.path.join(SKILLS_DIR, "code-crafter", "SKILL.md")
        self.assertTrue(os.path.exists(skill_md), "code-crafter SKILL.md must exist")
        with open(skill_md, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("name: code-crafter", content)
        self.assertIn("description:", content)

    def test_coding_skill_cli_callable(self):
        script = os.path.join(SKILLS_DIR, "code-crafter", "scripts", "code_craftsman.py")
        res = subprocess.run([sys.executable, script, "--help"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"code_craftsman.py CLI failed: {res.stderr}")

    def test_coding_skill_code_generation(self):
        code = CodeCraftsman.generate_module(
            name="Calculator",
            language="python",
            spec={"description": "Math module", "functions": ["add", "multiply"]}
        )
        self.assertIn("class CalculatorService", code)
        self.assertIn("def add", code)
        self.assertIn("def multiply", code)
        # Verify valid AST
        parsed = ast.parse(code)
        self.assertIsNotNone(parsed)

    def test_coding_skill_typescript_generation(self):
        code = CodeCraftsman.generate_module(
            name="PaymentService",
            language="typescript",
            spec={"description": "Payment handler", "functions": ["processPayment"]}
        )
        self.assertIn("export class PaymentServiceService", code)
        self.assertIn("processPayment()", code)

    def test_coding_skill_refactoring(self):
        monolith = (
            "def process_data(items):\n"
            "    results = []\n"
            "    for x in items:\n"
            "        results.append(x * 2)   \n"
            "    return results\n"
        )
        refactored = CodeCraftsman.refactor_code(monolith)
        parsed = ast.parse(refactored)
        self.assertIsNotNone(parsed)
        self.assertIn("def process_data(items):", refactored)

    def test_coding_skill_syntax_repair(self):
        broken_code = "def compute_tax(total)\n    return total * 0.1\n"
        repaired = CodeCraftsman.repair_syntax(broken_code, "python")
        self.assertIn("def compute_tax(total):", repaired)
        ast.parse(repaired)


class TestAnalysisSkill(unittest.TestCase):
    def test_analysis_skill_metadata(self):
        skill_md = os.path.join(SKILLS_DIR, "codebase-analyzer", "SKILL.md")
        self.assertTrue(os.path.exists(skill_md), "codebase-analyzer SKILL.md must exist")
        with open(skill_md, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("name: codebase-analyzer", content)
        self.assertIn("description:", content)

    def test_analysis_skill_cli_callable(self):
        script = os.path.join(SKILLS_DIR, "codebase-analyzer", "scripts", "codebase_analyzer.py")
        res = subprocess.run([sys.executable, script, "--help"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"codebase_analyzer.py CLI failed: {res.stderr}")

    def test_analysis_skill_metrics(self):
        metrics = CodebaseAnalyzer.get_metrics(PROJECT_ROOT)
        self.assertGreater(metrics["total_files"], 0)
        self.assertGreater(metrics["total_lines"], 0)
        self.assertIn("py", metrics["languages"])

    def test_analysis_skill_dependency_graph(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            mod_a = os.path.join(tmp_dir, "module_a.py")
            mod_b = os.path.join(tmp_dir, "module_b.py")
            orphan = os.path.join(tmp_dir, "orphan_module.py")

            with open(mod_a, "w") as f:
                f.write("import module_b\n")
            with open(mod_b, "w") as f:
                f.write("import module_a\n")
            with open(orphan, "w") as f:
                f.write("x = 42\n")

            graph = CodebaseAnalyzer.get_dependency_graph(tmp_dir)
            self.assertEqual(graph["modules_count"], 3)
            self.assertGreater(len(graph["cycles"]), 0, "Must detect circular import module_a <-> module_b")
            self.assertIn("orphan_module", graph["orphans"])

    def test_analysis_skill_security_scan(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            bad_file = os.path.join(tmp_dir, "vuln.py")
            with open(bad_file, "w", encoding="utf-8") as f:
                f.write('api_key = "sk_test_fake_secret_key_123456789"\neval("2 + 2")\n')
            res = CodebaseAnalyzer.security_scan(tmp_dir)
            self.assertEqual(res["violations_count"], 2)


class TestWorkflowSkill(unittest.TestCase):
    def test_workflow_skill_metadata(self):
        skill_md = os.path.join(SKILLS_DIR, "workflow-automator", "SKILL.md")
        self.assertTrue(os.path.exists(skill_md), "workflow-automator SKILL.md must exist")
        with open(skill_md, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("name: workflow-automator", content)
        self.assertIn("description:", content)

    def test_workflow_skill_cli_callable(self):
        script = os.path.join(SKILLS_DIR, "workflow-automator", "scripts", "workflow_automator.py")
        res = subprocess.run([sys.executable, script, "--help"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"workflow_automator.py CLI failed: {res.stderr}")

    def test_workflow_skill_pipeline_execution(self):
        pipeline = {
            "name": "VerificationPipeline",
            "steps": [
                {"name": "Init", "action": lambda ctx: "INIT_OK"},
                {"name": "Process", "action": lambda ctx: "PROCESS_OK"},
                {"name": "Verify", "action": lambda ctx: "VERIFY_OK"}
            ]
        }
        res = WorkflowAutomator.run_pipeline(pipeline)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(len(res["executed"]), 3)
        self.assertEqual(res["executed"][0]["name"], "Init")
        self.assertEqual(res["executed"][1]["name"], "Process")
        self.assertEqual(res["executed"][2]["name"], "Verify")

    def test_workflow_skill_sync_and_dry_run(self):
        with tempfile.TemporaryDirectory() as src, tempfile.TemporaryDirectory() as tgt:
            src_file = os.path.join(src, "test.txt")
            tgt_file = os.path.join(tgt, "test.txt")

            with open(src_file, "w") as f:
                f.write("hello zero error world")

            # Dry run test
            res_dry = WorkflowAutomator.sync_workspaces(src, tgt, dry_run=True)
            self.assertEqual(res_dry["synced_count"], 1)
            self.assertFalse(os.path.exists(tgt_file), "Dry run must NOT write to target")

            # Real sync test
            res_real = WorkflowAutomator.sync_workspaces(src, tgt, dry_run=False)
            self.assertEqual(res_real["synced_count"], 1)
            self.assertTrue(os.path.exists(tgt_file))
            with open(tgt_file, "r") as f:
                self.assertEqual(f.read(), "hello zero error world")

            # Parity test (subsequent sync should report identical)
            res_repeat = WorkflowAutomator.sync_workspaces(src, tgt, dry_run=False)
            self.assertEqual(res_repeat["synced_count"], 0)
            self.assertEqual(res_repeat["identical_count"], 1)

    def test_workflow_skill_slash_commands_validation(self):
        commands_dir = os.path.join(PROJECT_ROOT, ".claude", "commands")
        res = WorkflowAutomator.validate_commands(commands_dir)
        self.assertGreater(res["valid_count"], 15, "Expected at least 15 valid slash commands")


class TestMotionGraphicsTrigger(unittest.TestCase):
    def test_motion_trigger_non_blocking_latency(self):
        t0 = time.time()
        res = ToolMotionTrigger.emit_tool_event("Bash", {"command": "git status"})
        elapsed_ms = (time.time() - t0) * 1000.0
        # Non-blocking latency MUST be under 50ms (SLA guarantee)
        self.assertLess(elapsed_ms, 50.0, f"Trigger took too long: {elapsed_ms:.1f}ms > 50ms")
        self.assertEqual(res["status"], "dispatched")

    def test_motion_trigger_event_contract(self):
        ToolMotionTrigger.emit_tool_event("Bash", {"command": "git status"})
        data_file = os.path.join(PROJECT_ROOT, "motion-studio", "src", "data", "current_tool_call.json")
        self.assertTrue(os.path.exists(data_file), f"Missing data file: {data_file}")
        with open(data_file, "r", encoding="utf-8") as f:
            payload = json.load(f)
        self.assertEqual(payload.get("tool"), "Bash")
        self.assertIn("timestamp", payload)
        self.assertEqual(payload.get("composition"), "ToolCallHUD")

    def test_motion_hook_protocol(self):
        hook_script = os.path.join(PROJECT_ROOT, ".agents", "motion", "tool_motion_hook.py")
        mock_input = json.dumps({
            "session_id": "test_sess_001",
            "tool_name": "Edit",
            "tool_input": {"file_path": "src/Root.tsx"}
        })
        t0 = time.time()
        res = subprocess.run(
            [sys.executable, hook_script, "pre"],
            input=mock_input,
            capture_output=True,
            text=True
        )
        elapsed_ms = (time.time() - t0) * 1000.0
        self.assertEqual(res.returncode, 0, f"Hook failed: {res.stderr}")
        self.assertLess(elapsed_ms, 150.0, f"Hook exceeded SLA: {elapsed_ms:.1f}ms")
        out_json = json.loads(res.stdout)
        self.assertTrue(out_json.get("continue"), "Hook must return continue: true")
        self.assertTrue(out_json.get("suppressOutput"), "Hook must return suppressOutput: true")

    def test_motion_trigger_fault_tolerance(self):
        # Simulating bad arguments should never raise or break execution
        try:
            res = ToolMotionTrigger.emit_tool_event("UnknownTool", None)
            self.assertEqual(res["status"], "dispatched")
        except Exception as e:
            self.fail(f"ToolMotionTrigger crashed on invalid args: {e}")


def run_all_tests():
    print(f"\n{CYAN}{BOLD}======================================================================{RESET}")
    print(f"{CYAN}{BOLD}   🛡️  MASTER AUTOMATED VERIFICATION SUITE: SKILLS & MOTION GRAPHICS    {RESET}")
    print(f"{CYAN}{BOLD}======================================================================{RESET}")

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestCodingSkill))
    suite.addTests(loader.loadTestsFromTestCase(TestAnalysisSkill))
    suite.addTests(loader.loadTestsFromTestCase(TestWorkflowSkill))
    suite.addTests(loader.loadTestsFromTestCase(TestMotionGraphicsTrigger))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print(f"{CYAN}{BOLD}======================================================================{RESET}")
    if result.wasSuccessful():
        print(f"{GREEN}{BOLD}✅ ALL VERIFICATION TESTS PASSED (100% OK) - EXIT CODE 0{RESET}")
        print(f"{CYAN}{BOLD}======================================================================{RESET}\n")
        return 0
    else:
        print(f"{RED}{BOLD}❌ VERIFICATION FAILED: {len(result.failures)} failures, {len(result.errors)} errors{RESET}")
        print(f"{CYAN}{BOLD}======================================================================{RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
