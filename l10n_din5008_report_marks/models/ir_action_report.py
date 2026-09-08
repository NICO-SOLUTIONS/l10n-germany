# Copyright (C) 2026-TODAY NICO SOLUTIONS - ENGINEERING & IT (<https://www.nico-solutions.de>)
# @author Nils Coenen <nils.coenen@nico-solutions.de>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import io

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

from odoo import models


class IrActionsReportDin5008(models.Model):
    _inherit = "ir.actions.report"

    def _render_qweb_pdf(self, *args, **kwargs):
        company = self.env.company
        pdf_content, report_type = super()._render_qweb_pdf(
            *args,
            **kwargs,
        )
        din_type = self._get_din5008_type(company)

        if not din_type:
            return pdf_content, report_type

        if not (company.l10n_din5008_fold_marker or company.l10n_din5008_hole_marker):
            return pdf_content, report_type

        pdf_content = self._add_din5008_report_marks(
            pdf_content,
            din_type,
            fold_marker=company.l10n_din5008_fold_marker,
            hole_marker=company.l10n_din5008_hole_marker,
        )

        return pdf_content, report_type

    def _get_din5008_type(self, company):
        if company.external_report_layout_id != self.env.ref(
            "l10n_din5008.external_layout_din5008",
        ):
            return None

        return {
            self.env.ref(
                "l10n_din5008.paperformat_euro_din_a",
            ): "a",
            self.env.ref(
                "l10n_din5008.paperformat_euro_din",
            ): "b",
        }.get(company.paperformat_id)

    @staticmethod
    def _add_din5008_report_marks(
        pdf_content,
        din_type,
        fold_marker=True,
        hole_marker=True,
    ):
        mm = 72 / 25.4
        page_width = 210 * mm
        page_height = 297 * mm

        fold_positions = {
            "a": (87, 192),
            "b": (105, 210),
        }[din_type]

        overlay = io.BytesIO()
        pdf_canvas = canvas.Canvas(
            overlay,
            pagesize=(page_width, page_height),
        )
        pdf_canvas.setLineWidth(0.2 * mm)

        def draw_mark(position, length):
            pdf_canvas.line(
                0,
                page_height - position * mm,
                length * mm,
                page_height - position * mm,
            )

        if fold_marker:
            for position in fold_positions:
                draw_mark(position, 5)

        if hole_marker:
            draw_mark(148.5, 8)

        pdf_canvas.save()
        overlay.seek(0)

        overlay_page = PdfReader(overlay).pages[0]
        pdf_writer = PdfWriter()

        for page in PdfReader(io.BytesIO(pdf_content)).pages:
            pdf_writer.add_page(page)

        for page in pdf_writer.pages:
            page.merge_page(overlay_page)

        output = io.BytesIO()
        pdf_writer.write(output)

        return output.getvalue()
