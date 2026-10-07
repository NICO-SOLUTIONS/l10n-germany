## L10n DIN5008 Report Base
This module provides the base functionality for configuring and extending DIN 5008 report layouts in Odoo.
It introduces a centralized configuration dialog for DIN 5008 layout settings and provides a registry that allows additional modules to contribute their own configuration fields.

### Features
* Configure DIN 5008 layout settings through the company document layout.
* Store all DIN 5008 settings in a centralized JSON field on the company.
* Configure fold marks and punch/hole marks.
* Configure company logo position and size.
* Customize sender address formatting, including separators and spacing.
* Configure country indicators for sender addresses.
* Adjust sender and recipient address font scaling independently.
* Separate sender and recipient address styling in DIN 5008 reports.
* Configure the sender address left margin.
* Configure the bottom page margin.
* Support reusable configuration fields, including booleans, selections, numeric values, text, and lists.
* Validate configuration values before applying changes.
* Allow additional modules to register their own DIN 5008 settings without modifying the base configuration dialog.
* Apply configured settings to DIN 5008 reports.

The configuration is stored in a single JSON field on the company, which serves as the central source of truth for DIN 5008 settings.
Additional modules can extend the configuration through the registry mechanism, keeping module-specific settings separate while reusing the base configuration dialog and storage.
