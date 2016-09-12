/*eslint quote-props: [2, "always"] */

'use strict';

module.exports = {
    'plugins': [],

    'extends': [],

    // http://stylelint.io/user-guide/rules/
    'rules': {
        // 'at-rule-blacklist': [],
        'at-rule-empty-line-before': 'always',
        'at-rule-name-case': 'lower',
        'at-rule-name-newline-after': 'always-multi-line',
        'at-rule-name-space-after': 'always-single-line',
        'at-rule-no-unknown': [true, {
            'ignoreAtRules': [],
        }],
        'at-rule-no-vendor-prefix': true,
        'at-rule-semicolon-newline-after': 'always',
        // 'at-rule-whitelist': [],
        // 'block-closing-brace-empty-line-before': 'always-multi-line'|'never',
        // 'block-closing-brace-newline-after': 'always'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        // 'block-closing-brace-newline-before': 'always'|'always-multi-line'|'never-multi-line',
        // 'block-closing-brace-space-after': 'always'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        // 'block-closing-brace-space-before': 'always'|'never'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        'block-no-empty': [true, {
            'severity': 'warning',
        }],
        'block-no-single-line': true,
        // 'block-opening-brace-newline-after': 'always'|'always-multi-line'|'never-multi-line',
        // 'block-opening-brace-newline-before': 'always'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        // 'block-opening-brace-space-after': 'always'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        // 'block-opening-brace-space-before': 'always'|'always-single-line'|'never-single-line'|'always-multi-line'|'never-multi-line',
        'color-hex-case': 'lower',
        'color-hex-length': 'long',
        // 'color-named': 'always-where-possible'|'never',
        // 'color-no-hex': true,
        'color-no-invalid-hex': true,
        // 'comment-empty-line-before': 'always'|'never',
        'comment-no-empty': true,
        // 'comment-whitespace-inside': 'always'|'never',
        // 'comment-word-blacklist': string|[],
        // 'custom-media-pattern': string,
        // 'custom-property-empty-line-before': 'always'|'never',
        // 'custom-property-no-outside-root': true,
        // 'custom-property-pattern': string,
        'declaration-bang-space-after': 'never',
        'declaration-bang-space-before': 'always',
        'declaration-block-no-duplicate-properties': true,
        'declaration-block-no-ignored-properties': [true, {
            'severity': 'warning',
        }],
        'declaration-block-no-redundant-longhand-properties': true,
        'declaration-block-no-shorthand-property-overrides': true,
        // 'declaration-block-properties-order': 'alphabetical'|[],
        // 'declaration-block-semicolon-newline-after': 'always'|'always-multi-line'|'never-multi-line',
        // 'declaration-block-semicolon-newline-before': 'always'|'always-multi-line'|'never-multi-line',
        'declaration-block-semicolon-space-after': 'always-single-line',
        'declaration-block-semicolon-space-before': 'never',
        'declaration-block-single-line-max-declarations': 1,
        'declaration-block-trailing-semicolon': 'always',
        // 'declaration-colon-newline-after': 'always'|'always-multi-line',
        'declaration-colon-space-after': 'always-single-line',
        'declaration-colon-space-before': 'never',
        // 'declaration-empty-line-before': 'always'|'never',
        'declaration-no-important': true,
        // 'declaration-property-unit-blacklist': {},
        // 'declaration-property-unit-whitelist': {},
        // 'declaration-property-value-blacklist': {},
        // 'declaration-property-value-whitelist': {},
        'font-family-name-quotes': 'always-unless-keyword',
        'font-weight-notation': 'named-where-possible',
        //'function-blacklist': [],
        'function-calc-no-unspaced-operator': true,
        'function-comma-newline-after': 'never-multi-line',
        'function-comma-newline-before': 'never-multi-line',
        'function-comma-space-after': 'always',
        'function-comma-space-before': 'never',
        'function-linear-gradient-no-nonstandard-direction': true,
        'function-max-empty-lines': 0,
        'function-name-case': 'lower',
        // 'function-parentheses-newline-inside': 'always'|'always-multi-line'|'never-multi-line',
        'function-parentheses-space-inside': 'never-single-line',
        // 'function-url-data-uris': 'always'|'never',
        // 'function-url-no-scheme-relative': true,
        'function-url-scheme-whitelist': ['https'],
        'function-url-quotes': 'always',
        //'function-whitelist': [],
        'function-whitespace-after': 'always',
        'indentation': 4,
        'keyframe-declaration-no-important': true,
        // 'length-zero-no-unit': true,
        'max-empty-lines': 2,
        // 'max-line-length': int,
        // 'max-nesting-depth': int,
        'media-feature-colon-space-after': 'always',
        'media-feature-colon-space-before': 'never',
        'media-feature-name-case': 'lower',
        'media-feature-name-no-unknown': [true, {
            'ignoreMediaFeatureNames': [],
        }],
        'media-feature-name-no-vendor-prefix': true,
        'media-feature-no-missing-punctuation': true,
        'media-feature-parentheses-space-inside': 'never',
        'media-feature-range-operator-space-after': 'always',
        'media-feature-range-operator-space-before': 'always',
        // 'media-query-list-comma-newline-after': 'always'|'always-multi-line'|'never-multi-line',
        // 'media-query-list-comma-newline-before': 'always'|'always-multi-line'|'never-multi-line',
        // 'media-query-list-comma-space-after': 'always'|'never'|'always-single-line'|'never-single-line',
        // 'media-query-list-comma-space-before': 'always'|'never'|'always-single-line'|'never-single-line',
        'no-browser-hacks': true,
        'no-descending-specificity': true,
        'no-duplicate-selectors': true,
        'no-empty-source': true,
        // 'no-eol-whitespace': true,
        'no-extra-semicolons': true,
        // 'no-indistinguishable-colors': true,
        'no-invalid-double-slash-comments': true,
        'no-missing-end-of-source-newline': true,
        'no-unknown-animations': true,
        // 'no-unsupported-browser-features': true,
        // 'number-leading-zero': 'always'|'never',
        // 'number-max-precision': int,
        // 'number-no-trailing-zeros': true,
        // 'property-blacklist': string|[],
        'property-case': 'lower',
        'property-no-unknown': true,
        'property-no-vendor-prefix': true,
        // 'property-whitelist': string|[],
        // 'root-no-standard-properties': true,
        // 'rule-nested-empty-line-before': 'always'|'never',
        // 'rule-non-nested-empty-line-before': 'always'|'never',
        'selector-attribute-brackets-space-inside': 'never',
        // 'selector-attribute-operator-blacklist': string|[],
        'selector-attribute-operator-space-after': 'never',
        'selector-attribute-operator-space-before': 'never',
        // 'selector-attribute-operator-whitelist': string|[],
        'selector-attribute-quotes': 'always',
        // 'selector-class-pattern': string,
        'selector-combinator-space-after': 'always',
        'selector-combinator-space-before': 'always',
        'selector-descendant-combinator-no-non-space': true,
        // 'selector-id-pattern': string,
        // 'selector-list-comma-newline-after': 'always'|'always-multi-line'|'never-multi-line',
        // 'selector-list-comma-newline-before': 'always'|'always-multi-line'|'never-multi-line',
        'selector-list-comma-space-after': 'always-single-line',
        'selector-list-comma-space-before': 'never-single-line',
        'selector-max-empty-lines': 0,
        // 'selector-max-compound-selectors': int,
        // 'selector-max-specificity': string,
        // 'selector-nested-pattern': string,
        // 'selector-no-attribute': true,
        // 'selector-no-combinator': true,
        // 'selector-no-id': true,
        // 'selector-no-qualifying-type': true,
        // 'selector-no-type': true,
        'selector-no-universal': true,
        'selector-no-vendor-prefix': true,
        // 'selector-pseudo-class-blacklist': [],
        'selector-pseudo-class-case': 'lower',
        'selector-pseudo-class-no-unknown': true,
        // 'selector-pseudo-class-parentheses-space-inside': 'always'|'never',
        // 'selector-pseudo-class-whitelist': string|[],
        'selector-pseudo-element-case': 'lower',
        'selector-pseudo-element-colon-notation': 'double',
        'selector-pseudo-element-no-unknown': true,
        'selector-root-no-composition': true,
        'selector-type-case': 'lower',
        'selector-type-no-unknown': [true, {
            'ignoreTypes': [],
        }],
        'shorthand-property-no-redundant-values': [true, {
            'severity': 'warning',
        }],
        'string-no-newline': true,
        'string-quotes': 'single',
        'stylelint-disable-reason': 'always-before',
        'time-no-imperceptible': true,
        // 'unit-blacklist': string|[],
        'unit-case': 'lower',
        'unit-no-unknown': true,
        // 'unit-whitelist': string|[],
        'value-keyword-case': 'lower',
        // 'value-list-comma-newline-after': 'always'|'always-multi-line'|'never-multi-line',
        // 'value-list-comma-newline-before': 'always'|'always-multi-line'|'never-multi-line',
        'value-list-comma-space-after': 'always-single-line',
        'value-list-comma-space-before': 'never-single-line',
        'value-list-max-empty-lines': 0,
        'value-no-vendor-prefix': true,
    },
};
