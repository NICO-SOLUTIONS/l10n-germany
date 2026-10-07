# Copyright 2026 NICO SOLUTIONS - ENGINEERING & IT (<https://www.nico-solutions.de>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class BaseDocumentLayout(models.TransientModel):
    _inherit = "base.document.layout"

    l10n_din5008_config = fields.Json(
        string="DIN 5008 Configuration",
        related="company_id.l10n_din5008_config",
        readonly=False,
    )

    def _get_din5008_config(self):
        self.ensure_one()
        return self.l10n_din5008_config or {}

    def _get_din5008_config_value(
        self,
        *keys,
        default=None,
    ):
        self.ensure_one()

        value = self._get_din5008_config()

        for key in keys:
            if not isinstance(value, dict):
                return default

            value = value.get(key)

        return default if value is None else value

    @api.onchange("paperformat_id", "l10n_din5008_config")
    def _onchange_din5008_report_config(self):
        self._compute_preview()
