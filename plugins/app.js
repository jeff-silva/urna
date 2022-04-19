import Vue from 'vue';

// Element UI
import Element from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';
Vue.use(Element, { locale });

import validate from 'validate.js';
Vue.prototype.$validate = function(value, constraints={}) {
    let v = validate(value, constraints);
    let invalid = !!Object.keys(v||{}).length;
    let valid = !invalid;
    let fields = v || {};

    let errors = [];
    Object.values(v||{}).forEach(errs => {
        errs.forEach(err => {
            errors.push(err);
        });
    });

    let get = (kname, glue='<br>') => {
        return (fields[kname] || []).join(glue);
    };

    return { valid, invalid, fields, errors, get };
};

// import axios from 'axios';
export default async function (ctx) {
    // let resp = await axios.get('/api/settings/all');
    // ctx.store.state.settings = resp.data;
}