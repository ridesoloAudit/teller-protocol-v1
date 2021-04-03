import "./asset-setting-names.sol";
import "./roles.sol";
import "../../../contexts/#access-control/modifiers/authorized.sol";
import "../../../contexts/#access-control/storage.sol";
import "../storage.sol";
import "../data.sol";
import "../../../../contracts/providers/compound/CErc20Interface.sol";
import "../libraries/CacheLib.sol";
import "../interfaces/IAssetSettings.sol";

abstract contract AssetSettingsManagement is
    AssetSettingNames,
    Roles,
    sto_AccessControl_v1,
    mod_authorized_AccessControl_v1,
    sto_AssetSettings_v1,
    dat_AssetSettings_v1,
    sto_AssetRegistry_v1
{}
