import {Component} from "@odoo/owl";
import {Din5008ConfigDialog} from "../din5008_config_dialog/din5008_config_dialog.esm";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {useService} from "@web/core/utils/hooks";

export class Din5008ConfigField extends Component {
    static template = "l10n_din5008_report_base.Din5008ConfigField";

    static props = {
        ...standardFieldProps,
    };

    setup() {
        this.dialog = useService("dialog");
    }

    get config() {
        return this.props.record.data[this.props.name] || {};
    }

    openDialog() {
        this.dialog.add(Din5008ConfigDialog, {
            config: this.config,
            onApply: async (newConfig) => {
                await this.props.record.update({
                    [this.props.name]: newConfig,
                });
            },
        });
    }
}

registry.category("fields").add("din5008_config", {
    component: Din5008ConfigField,
    supportedTypes: ["json"],
});
