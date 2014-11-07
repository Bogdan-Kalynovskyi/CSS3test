/* Function tries to set the CSS value to DOM object and then read from it. 

Never tested this function on large amount of exotic browsers, but my code is safer than just checking for the CSS property availability. Ah, yes, it can distinguish 2D transform support from 3D transform support! Just pass the function CSS values you want to test! 

The plus of this code is that it detects the vendor prefix supported (if any). Possible return values: 

   `false`,   when feature unsupported, or

    {
        vendor: 'moz',
        cssStyle: '-moz-transition',
        jsStyle: 'MozTransition'
    }

 when feature supported
*/

    /**
     * Test for CSS3 features support.
     * This function is not generic, but it works well for transition and transform at least
     */
    testCSSSupport: function (feature, cssTestValue/* can be optional */) {
        var testDiv,
            featureCapital = feature.charAt(0).toUpperCase() + feature.substr(1),
            vendors = ['', 'webkit', 'moz', 'ms'],
            jsPrefixes = ['', 'Webkit', 'Moz', 'ms'],
            defaultTestValues = {
                transition: 'left 2s ease 1s',
                transform: 'rotateX(-180deg) translateZ(.5em) scale(0.5)'
               // This will test for 3D transform support
               // Use other values if you need to test for 2D support only
            },
            testFunctions = {
                transition: function (jsProperty, computed) {
                    return computed[jsProperty + 'Delay'] === '1s' && computed[jsProperty + 'Duration'] === '2s' && computed[jsProperty + 'Property'] === 'left';
                },
                transform: function (jsProperty, computed) {
                    return computed[jsProperty].substr(0, 9) === 'matrix3d(';
                }
            };

        /* test given vendor prefix */
        function isStyleSupported(feature, jsPrefixedProperty) {
            if (jsPrefixedProperty in testDiv.style) {
                var testVal = cssTestValue || defaultTestValues[feature],
                    testFn = testFunctions[feature];

                testDiv.style[jsPrefixedProperty] = defaultTestValues[feature];
                var computed = window.getComputedStyle(testDiv);

                if (testFn) {
                    return testFn(jsPrefixedProperty, computed);
                }
                else {
                    return computed[jsPrefixedProperty] === testVal;
                }
            }
            return false;
        }

        //Assume browser without getComputedStyle is either IE8 or something even more poor
        if (!window.getComputedStyle) {
            return false;
        }

        //Create a div for tests and remove it afterwards
        if (!testDiv) {
            testDiv = document.createElement('div');
            document.body.appendChild(testDiv);
            setTimeout(function () {
                document.body.removeChild(testDiv);
                testDiv = null;
            }, 0);
        }

        var cssPrefixedProperty,
            jsPrefixedProperty;

        for (var i = 0; i < vendors.length; i++) {
            if (i === 0) {
                cssPrefixedProperty = feature;  //todo: this code now works for single-word features only!
                jsPrefixedProperty = feature;   //therefore box-sizing -> boxSizing won't work here
            }
            else {
                cssPrefixedProperty = '-' + vendors[i] + '-' + feature;
                jsPrefixedProperty = jsPrefixes[i] + featureCapital;
            }

            if (isStyleSupported(feature, jsPrefixedProperty)) {
                return {
                    vendor: vendors[i],
                    cssStyle: cssPrefixedProperty,
                    jsStyle: jsPrefixedProperty
                };
            }
        }

        return false;
    }

