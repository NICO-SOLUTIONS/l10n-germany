# Copyright (C) 2026-TODAY NICO SOLUTIONS - ENGINEERING & IT (<https://www.nico-solutions.de>)
# @author Nils Coenen <nils.coenen@nico-solutions.de>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import io
from unittest.mock import patch

from pypdf import PdfReader
from reportlab.pdfgen import canvas

from odoo.addons.base.tests.common import BaseCommon
from odoo.addons.l10n_din5008_report_marks.models.ir_action_report import (
    IrActionsReportDin5008,
)


class TestDin5008ReportMarks(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.company
        cls.report_model = cls.env["ir.actions.report"]
        cls.din5008_layout = cls.env.ref(
            "l10n_din5008.external_layout_din5008",
        )
        cls.din_type_a = cls.env.ref(
            "l10n_din5008.paperformat_euro_din_a",
        )
        cls.din_type_b = cls.env.ref(
            "l10n_din5008.paperformat_euro_din",
        )
        cls.report = cls.report_model.search(
            [],
            limit=1,
        )
        cls.report_ref = cls.report.get_external_id().get(
            cls.report.id,
        )

    def setUp(self):
        super().setUp()
        self.company.external_report_layout_id = self.din5008_layout
        self.company.paperformat_id = self.din_type_a

    def test_get_din5008_type_a(self):
        self.assertEqual(
            self.report_model._get_din5008_type(self.company),
            "a",
        )

    def test_get_din5008_type_b(self):
        self.company.paperformat_id = self.din_type_b
        self.assertEqual(
            self.report_model._get_din5008_type(self.company),
            "b",
        )

    def test_get_din5008_type_wrong_layout(self):
        self.company.external_report_layout_id = False
        self.assertFalse(
            self.report_model._get_din5008_type(self.company),
        )

    def test_get_din5008_type_wrong_paperformat(self):
        paperformat = self.env["report.paperformat"].search(
            [
                (
                    "id",
                    "not in",
                    [
                        self.din_type_a.id,
                        self.din_type_b.id,
                    ],
                ),
            ],
            limit=1,
        )
        self.company.paperformat_id = paperformat
        self.assertFalse(
            self.report_model._get_din5008_type(self.company),
        )

    def test_add_din5008_report_marks(self):
        pdf_content = self._create_test_pdf()
        result = self.report_model._add_din5008_report_marks(
            pdf_content,
            "a",
            fold_marker=True,
            hole_marker=True,
        )
        self.assertTrue(result)
        self.assertEqual(
            PdfReader(io.BytesIO(result)).get_num_pages(),
            1,
        )

    def test_add_din5008_report_marks_fold_only(self):
        pdf_content = self._create_test_pdf()
        result = self.report_model._add_din5008_report_marks(
            pdf_content,
            "a",
            fold_marker=True,
            hole_marker=False,
        )
        self.assertTrue(result)

    def test_add_din5008_report_marks_hole_only(self):
        pdf_content = self._create_test_pdf()
        result = self.report_model._add_din5008_report_marks(
            pdf_content,
            "a",
            fold_marker=False,
            hole_marker=True,
        )
        self.assertTrue(result)

    def test_add_din5008_report_marks_without_markers(self):
        pdf_content = self._create_test_pdf()
        result = self.report_model._add_din5008_report_marks(
            pdf_content,
            "a",
            fold_marker=False,
            hole_marker=False,
        )
        self.assertTrue(result)

    @staticmethod
    def _create_test_pdf():
        output = io.BytesIO()
        pdf_canvas = canvas.Canvas(output)
        pdf_canvas.drawString(10, 10, "Test")
        pdf_canvas.save()
        return output.getvalue()

    @staticmethod
    def _patch_parent_render_qweb_pdf():
        return patch(
            "odoo.addons.base.models.ir_actions_report.IrActionsReport._render_qweb_pdf",
            return_value=(b"original-pdf", "pdf"),
        )

    def test_render_qweb_pdf_with_din5008_marks(self):
        self.company.l10n_din5008_fold_marker = True
        self.company.l10n_din5008_hole_marker = True
        with (
            self._patch_parent_render_qweb_pdf(),
            patch.object(
                IrActionsReportDin5008,
                "_add_din5008_report_marks",
                return_value=b"marked-pdf",
            ) as add_marks,
        ):
            result = self.report_model._render_qweb_pdf(
                self.report_ref,
            )

        add_marks.assert_called_once_with(
            b"original-pdf",
            "a",
            fold_marker=True,
            hole_marker=True,
        )
        self.assertEqual(
            result,
            (b"marked-pdf", "pdf"),
        )

    def test_render_qweb_pdf_without_din5008_type(self):
        self.company.external_report_layout_id = False
        with (
            self._patch_parent_render_qweb_pdf(),
            patch.object(
                IrActionsReportDin5008,
                "_add_din5008_report_marks",
            ) as add_marks,
        ):
            result = self.report_model._render_qweb_pdf(
                self.report_ref,
            )

        add_marks.assert_not_called()
        self.assertEqual(
            result,
            (b"original-pdf", "pdf"),
        )

    def test_render_qweb_pdf_without_markers(self):
        self.company.l10n_din5008_fold_marker = False
        self.company.l10n_din5008_hole_marker = False
        with (
            self._patch_parent_render_qweb_pdf(),
            patch.object(
                IrActionsReportDin5008,
                "_add_din5008_report_marks",
            ) as add_marks,
        ):
            result = self.report_model._render_qweb_pdf(
                self.report_ref,
            )

        add_marks.assert_not_called()
        self.assertEqual(
            result,
            (b"original-pdf", "pdf"),
        )
