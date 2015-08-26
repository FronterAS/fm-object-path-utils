'use strict';

describe('fm-object-path-utils', function () {
    var testData = {
            'nested': [
                {'body': 'foobar'},
                {
                    'body': {
                        'deep': [
                            {'down': 'inside'}
                        ]
                    }
                }
            ]
        };

    it('should find object path value by string', function () {
        var simpleResult = ObjectPathUtils.getValue('nested[0].body', testData),
            deepResult = ObjectPathUtils.getValue('nested[1].body.deep[0].down', testData);

        expect(simpleResult).to.equal('foobar');
        expect(deepResult).to.equal('inside');
    });
});
