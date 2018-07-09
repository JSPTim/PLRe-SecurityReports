import test from 'ava';
import UtilityFunctionsJSP from "./UtilityFunctions-JSP";
import data from './sox.data.json';

const utilityFunctionsJSP = new UtilityFunctionsJSP();

test('it should splits string on captial letters', t => {
    t.is(utilityFunctionsJSP.camelSpaces('abcdEf'), 'abcd Ef');
});




    test('it should return an array contain the list items from data items from data', t => {
            const result = utilityFunctionsJSP.getSPListItemCollection(data);
            t.true(Array.isArray(result));
            t.true(result[2].Title === 'Exco Drive report Q3 2018') ;
    });

    test('it should create an array from a sharepoint list object', t => {
            //console.log('XXXXX', data.get_count())
        t.deepEqual(utilityFunctionsJSP.buildDataRowsPlusFields(data), []);
    });

