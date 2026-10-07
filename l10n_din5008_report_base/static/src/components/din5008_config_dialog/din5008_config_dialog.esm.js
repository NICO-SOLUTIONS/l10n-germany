import {Component, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";

const din5008ConfigRegistry = registry.category("din5008_config_fields");

export class Din5008ConfigDialog extends Component {
    static template = "l10n_din5008_report_base.Din5008ConfigDialog";

    static components = {
        Dialog,
    };

    static props = {
        close: Function,
        config: Object,
        onApply: Function,
    };

    setup() {
        this.notification = useService("notification");

        this.state = useState({
            config: this._clone(this.props.config),
            expandedSections: {},
        });
    }

    _clone(value) {
        return JSON.parse(JSON.stringify(value || {}));
    }

    get sections() {
        const sections = new Map();

        for (const field of din5008ConfigRegistry.getAll()) {
            const section = field.section || "din5008";

            if (!sections.has(section)) {
                sections.set(section, {
                    name: section,
                    label: field.sectionLabel || section,
                    priority: field.sectionPriority ?? 100,
                    fields: [],
                });
            }

            const sectionData = sections.get(section);
            sectionData.fields.push(field);

            // Use the lowest priority if fields in one section differ.
            sectionData.priority = Math.min(
                sectionData.priority,
                field.sectionPriority ?? 100
            );
        }

        return Array.from(sections.values()).sort(
            (a, b) => a.priority - b.priority || a.name.localeCompare(b.name)
        );
    }

    toggleSection = (sectionName) => {
        this.state.expandedSections[sectionName] =
            !this.state.expandedSections[sectionName];
    };

    isSectionExpanded(sectionName) {
        return Boolean(this.state.expandedSections[sectionName]);
    }

    getValue(field) {
        const keys = field.key.split(".");
        let value = this.state.config;

        for (const key of keys) {
            if (!value || typeof value !== "object") {
                return this._getDefaultValue(field);
            }
            value = value[key];
        }

        return value ?? this._getDefaultValue(field);
    }

    _getDefaultValue(field) {
        if (typeof field.default === "function") {
            return field.default();
        }
        return field.default;
    }

    setValue = (field, value) => {
        const keys = field.key.split(".");
        let current = this.state.config;

        for (const key of keys.slice(0, -1)) {
            if (
                !current[key] ||
                typeof current[key] !== "object" ||
                Array.isArray(current[key])
            ) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    };

    getSelectionOptions(field) {
        if (typeof field.options === "function") {
            return field.options(this.state.config, this.env.lang) || [];
        }
        return field.options || [];
    }

    updateFloat = (field, value) => {
        if (value === "" || value === null) {
            return;
        }

        let number = Number.parseFloat(value);

        if (!Number.isFinite(number)) {
            return;
        }

        if (field.min !== undefined) {
            number = Math.max(field.min, number);
        }
        if (field.max !== undefined) {
            number = Math.min(field.max, number);
        }

        this.setValue(field, number);
    };

    updateBoolean = (field, value) => {
        this.setValue(field, Boolean(value));
    };

    updateSelection = (field, value) => {
        this.setValue(field, value);
    };

    updateText = (field, value) => {
        this.setValue(field, value);
    };

    // Generic list support
    getListFields(field) {
        return Object.entries(field.fields || {});
    }

    getListValue(field) {
        const value = this.getValue(field);
        return Array.isArray(value) ? value : [];
    }

    addListItem = (field) => {
        const item = {};

        for (const [name, subField] of this.getListFields(field)) {
            switch (subField.type) {
                case "translated_text":
                    item[name] = {};
                    break;
                case "text":
                    item[name] = "";
                    break;
                case "boolean":
                    item[name] = false;
                    break;
                case "float":
                    item[name] = subField.default ?? 0;
                    break;
                case "selection":
                    item[name] = subField.default ?? false;
                    break;
                default:
                    item[name] = subField.default ?? false;
            }
        }

        this.setValue(field, [...this.getListValue(field), item]);
    };

    removeListItem = (field, index) => {
        const items = [...this.getListValue(field)];
        items.splice(index, 1);
        this.setValue(field, items);
    };

    updateListField = (field, index, name, value) => {
        const items = this.getListValue(field).map((item) => ({...item}));

        if (!items[index]) {
            return;
        }

        items[index][name] = value;
        this.setValue(field, items);
    };

    // Generic translated-text support
    getTranslatedText(value) {
        if (typeof value === "string") {
            return value;
        }
        return value?.[this.env.lang] || "";
    }

    updateListTranslatedText = (field, index, name, value) => {
        const item = this.getListValue(field)[index];

        if (!item) {
            return;
        }

        const translations = {...(item[name] || {})};
        translations[this.env.lang] = value;

        this.updateListField(field, index, name, translations);
    };

    apply = () => {
        for (const section of this.sections) {
            for (const field of section.fields) {
                if (typeof field.validate !== "function") {
                    continue;
                }

                const value = this.getValue(field);

                if (!field.validate(value)) {
                    this.notification.add(
                        field.validationError || _t("The value is invalid."),
                        {type: "warning"}
                    );
                    return;
                }
            }
        }

        this.props.onApply(this._clone(this.state.config));
        this.props.close();
    };
}
