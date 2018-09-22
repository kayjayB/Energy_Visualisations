module.exports = {
    "extends": "eslint:recommended",
    "env": {
        "es6": true,
        "amd": true,
        "node": true,
        "jquery": true,
        "browser": true,
    },
    "parserOptions": {
        "ecmaVersion": 7,
        "sourceType": "module"
    },
    "plugins": [
        "tape"
    ],
    "globals": {
        "window": true,
        "document": true
    },
    "rules": {
        "tape/assertion-message": ["off", "always"],
        "tape/max-asserts": ["off", 5],
        "tape/no-identical-title": "error",
        "tape/no-ignored-test-files": "error",
        "tape/no-only-test": "error",
        "tape/no-skip-assert": "error",
        "tape/no-skip-test": "error",
        "tape/no-statement-after-end": "error",
        "tape/no-unknown-modifiers": "error",
        "tape/test-ended": "off",
        "tape/test-title": ["error", "if-multiple"],
        "tape/use-t-well": "error",
        "tape/use-t": "error",
        "tape/use-test": "error",
        "no-console": "off",
        "no-empty": "off",
        "no-useless-escape": "off",
        "no-control-regex": "off",
        "no-unused-vars": "off",
    }
};