pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../openzeppelin/SignedSafeMath.sol";
import "@chainlink/contracts/src/v0.5/interfaces/AggregatorInterface.sol";
import "../../interfaces/PairAggregatorInterface.sol";


/**
    @notice This is a Chainlink Oracle wrapper implementation. It uses the AggregatorInterface from Chainlink to get data.

    @author develop@teller.finance
 */
contract ChainlinkPairAggregator is PairAggregatorInterface {
    using SafeMath for uint256;
    using SignedSafeMath for int256;

    uint256 internal constant TEN = 10;
    uint256 internal constant MAX_POWER_VALUE = 50;

    AggregatorInterface public aggregator;
    uint8 public responseDecimals;
    uint8 public collateralDecimals;
    uint8 public pendingDecimals;

    /**
        @notice It creates a new ChainlinkPairAggregator instance.
        @param aggregatorAddress to use in this Chainlink pair aggregator.
        @param responseDecimalsValue the decimals included in the Chainlink response.
        @param collateralDecimalsValue the decimals included in the collateral token.
    */
    constructor(
        address aggregatorAddress,
        uint8 responseDecimalsValue,
        uint8 collateralDecimalsValue
    ) public {
        require(aggregatorAddress != address(0x0), "PROVIDE_AGGREGATOR_ADDRESS");
        aggregator = AggregatorInterface(aggregatorAddress);
        responseDecimals = responseDecimalsValue;
        collateralDecimals = collateralDecimalsValue;

        if (collateralDecimals >= responseDecimals) {
            pendingDecimals = collateralDecimals - responseDecimals;
        } else {
            pendingDecimals = responseDecimals - collateralDecimals;
        }
        require(pendingDecimals <= MAX_POWER_VALUE, "MAX_PENDING_DECIMALS_EXCEEDED");
    }

    /** External Functions */

    /**
        @notice Gets the current answer from the Chainlink aggregator oracle.
        @return a normalized response value.
     */
    function getLatestAnswer() external view returns (int256) {
        int256 latestAnswerInverted = aggregator.latestAnswer();
        return _normalizeResponse(latestAnswerInverted);
    }

    /**
        @notice Gets the past round answer from the Chainlink aggregator oracle.
        @param roundsBack the answer number to retrieve the answer for
        @return a normalized response value.
     */
    function getPreviousAnswer(uint256 roundsBack) external view returns (int256) {
        int256 answer = _getPreviousAnswer(roundsBack);
        return _normalizeResponse(answer);
    }

    /**
        @notice Gets the last updated height from the aggregator.
        @return the latest timestamp.
     */
    function getLatestTimestamp() external view returns (uint256) {
        return aggregator.latestTimestamp();
    }

    /**
        @notice Gets the latest completed round where the answer was updated.
        @return the latest round id.
    */
    function getLatestRound() external view returns (uint256) {
        return aggregator.latestRound();
    }

    /**
        @notice Gets block timestamp when an answer was last updated
        @param roundsBack the answer number to retrieve the updated timestamp for
        @return the previous timestamp.
     */
    function getPreviousTimestamp(uint256 roundsBack) external view returns (uint256) {
        uint256 latest = aggregator.latestRound();
        require(roundsBack <= latest, "NOT_ENOUGH_HISTORY");
        return aggregator.getTimestamp(latest - roundsBack);
    }

    /** Internal Functions */

    /**
        @notice Gets the past round answer from the Chainlink aggregator oracle.
        @param roundsBack the answer number to retrieve the answer for
        @return a non-normalized response value.
     */
    function _getPreviousAnswer(uint256 roundsBack) internal view returns (int256) {
        uint256 latest = aggregator.latestRound();
        require(roundsBack <= latest, "NOT_ENOUGH_HISTORY");
        return aggregator.getAnswer(latest - roundsBack);
    }

    /**
        @notice It normalizes a value depending on the collateral and response decimals configured in the contract.
        @param value to normalize.
        @return a normalized value.
     */
    function _normalizeResponse(int256 value) internal view returns (int256) {
        if (collateralDecimals >= responseDecimals) {
            return value.mul(int256(TEN**pendingDecimals));
        } else {
            return value.div(int256(TEN**pendingDecimals));
        }
    }
}
