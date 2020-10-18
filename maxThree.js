(() => {
    function maxProductOfThree(numbers) {

        if (numbers.length < 3)
            throw "error, array length must be superior or egal at 3"

        // maxPos1 >= maxPos2 >= maxPos3 >= ... >= maxNeg2 >= maxNeg1
        let maxPos1 = -Infinity;
        let maxPos2 = -Infinity;
        let maxPos3 = -Infinity;
        let maxNeg1 = +Infinity;
        let maxNeg2 = +Infinity;

        for (const n of numbers)
        {
            if (n > maxPos1) {
                maxPos3 = maxPos2;
                maxPos2 = maxPos1;
                maxPos1 = n;
            }
            else if (n > maxPos2) {
                maxPos3 = maxPos2;
                maxPos2 = n;
            }
            else if (n > maxPos3) {
                maxPos3 = n;
            }

            if (n <= maxNeg1) {
                maxNeg2 = maxNeg1;
                maxNeg1 = n;
            }
            else if (n < maxNeg2) {
                maxNeg2 = n;
            }
        }

        return Math.max(maxPos1 * maxPos2 * maxPos3, maxPos1 * maxNeg1 * maxNeg2);
    }
    console.log(maxProductOfThree([1, 10, 2, 6, 5, 3]))
})()