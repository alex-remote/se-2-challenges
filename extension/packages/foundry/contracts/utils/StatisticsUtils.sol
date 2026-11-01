// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

library StatisticsUtils {
    /////////////////
    /// 错误 //////
    /////////////////

    error EmptyArray();

    ///////////////////
    /// 函数 /////
    ///////////////////

    /**
     * @notice 使用选择排序将 uint256 数组按升序排序
     * @dev 使用选择排序算法，gas 效率不高，但对小数组来说可以接受。
     *      该实现完全仿照早期 MakerDAO 的 Medianizer。
     *      会原地修改输入数组。
     * @param arr 要按升序排序的 uint256 数组
     */
    function sort(uint256[] memory arr) internal pure {
        uint256 n = arr.length;
        for (uint256 i = 0; i < n; i++) {
            uint256 minIndex = i;
            for (uint256 j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex != i) {
                (arr[i], arr[minIndex]) = (arr[minIndex], arr[i]);
            }
        }
    }

    /**
     * @notice 计算已排序 uint256 数组的中位数
     * @dev 对于长度为偶数的数组，返回中间两个元素的平均值。
     *      对于长度为奇数的数组，返回中间元素。
     *      假定输入数组已按升序排好序。
     * @param arr 用于计算中位数的已排序 uint256 数组
     * @return uint256 类型的中位数
     */
    function getMedian(uint256[] memory arr) internal pure returns (uint256) {
        uint256 length = arr.length;
        if (length == 0) revert EmptyArray();
        if (length % 2 == 0) {
            return (arr[length / 2 - 1] + arr[length / 2]) / 2;
        } else {
            return arr[length / 2];
        }
    }
}
