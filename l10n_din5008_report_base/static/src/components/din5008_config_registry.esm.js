import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

const din5008ConfigRegistry = registry.category("din5008_config_fields");

din5008ConfigRegistry.add("margin_bottom", {
    key: "page.margin_bottom",
    label: _t("Margin Bottom"),
    section: "page",
    sectionLabel: _t("Page Layout"),
    sectionPriority: 10,
    type: "float",
    default: 28,
    min: 5,
    max: 60,
    step: 1,
});

din5008ConfigRegistry.add("fold_marker", {
    key: "marks.fold_marker",
    label: _t("Fold Marks"),
    section: "marks",
    sectionLabel: _t("Marks"),
    sectionPriority: 20,
    type: "boolean",
    default: true,
});

din5008ConfigRegistry.add("hole_marker", {
    key: "marks.hole_marker",
    label: _t("Punch/Hole Mark"),
    section: "marks",
    sectionLabel: _t("Marks"),
    type: "boolean",
    default: true,
});

din5008ConfigRegistry.add("company_logo_position", {
    key: "header.company_logo_position",
    label: _t("Company Logo Position"),
    section: "header",
    sectionLabel: _t("Header"),
    sectionPriority: 30,
    type: "selection",
    default: "left",
    options: [
        {value: "left", label: _t("Left")},
        {value: "right", label: _t("Right")},
    ],
});

din5008ConfigRegistry.add("company_logo_size", {
    key: "header.company_logo_size",
    label: _t("Company Logo Size"),
    section: "header",
    sectionLabel: _t("Header"),
    type: "float",
    default: 27,
    min: 20,
    max: 50,
    step: 1,
});

din5008ConfigRegistry.add("country_indicator", {
    key: "sender.country_indicator",
    label: _t("Country Indicator"),
    section: "sender",
    sectionLabel: _t("Sender Address"),
    sectionPriority: 40,
    type: "selection",
    default: "none",
    options: [
        {value: "none", label: _t("No Indicator")},
        {value: "code", label: _t("Country Code")},
        {value: "name", label: _t("Country Name")},
    ],
});

din5008ConfigRegistry.add("address_separator", {
    key: "sender.address_separator",
    label: _t("Address Separator"),
    section: "sender",
    sectionLabel: _t("Sender Address"),
    type: "selection",
    default: "pipe",
    options: [
        {value: "pipe", label: "|"},
        {value: "dot", label: "•"},
    ],
});

din5008ConfigRegistry.add("address_separator_gap", {
    key: "sender.address_separator_gap",
    label: _t("Address Separator Gap"),
    section: "sender",
    sectionLabel: _t("Sender Address"),
    type: "float",
    default: 0.0,
    min: 0.0,
    max: 5.0,
    step: 0.25,
});

din5008ConfigRegistry.add("address_margin_left", {
    key: "sender.address_margin_left",
    label: _t("Address Margin Left"),
    section: "sender",
    sectionLabel: _t("Sender Address"),
    type: "float",
    default: 0.0,
    min: 0.0,
    max: 2.0,
    step: 0.25,
});

din5008ConfigRegistry.add("sender_font_factor", {
    key: "sender.font_factor",
    label: _t("Font Size Scale Factor"),
    section: "sender",
    sectionLabel: _t("Sender Address"),
    type: "float",
    default: 1.0,
    min: 0.75,
    max: 2.0,
    step: 0.05,
});

din5008ConfigRegistry.add("receiver_font_factor", {
    key: "receiver.font_factor",
    label: _t("Font Size Scale Factor"),
    section: "receiver",
    sectionPriority: 50,
    sectionLabel: _t("Receiver Address"),
    type: "float",
    default: 1.0,
    min: 0.75,
    max: 1.5,
    step: 0.05,
});
