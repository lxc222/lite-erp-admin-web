export const globalConstDef = {
    MenuType: {
        Show: 100,
        Auth: 200
    },
    enableModel: {
        Enabled: 100,
        Disabled: 200
    },
    yesOrNo: {
        Yes: 100,
        No: 200
    },
    accountType: {
        Employee: 100,
        Merchant: 200
    },
    materialUnitType: {
        Supply: 200,
        Basic: 300,
        Stock: 400
    },
    materialPackType: {
        Purchase: 100,
        Single: 200,
        PackAgain: 300
    },
    materialProduceType: {
        PurchaseDirect: 1000,
        ProduceAlready: 2000,
        ProduceNeed: 3000
    },
    employeeStatus: {
        Wait: 50,
        Work: 100,
        Leave: 200
    },
    mktpAdmissionCostType: {
        Time: 100,
        Quantity: 1000
    },
    mktpWeightCostType: {
        Time: 100,
        Quantity: 1000
    },
    mktpCostItemType: {
        House: 100
    },
    mktpStoreCostRuleType: {
        CircleWhole: 100,
        CircleSqual: 200,
        Quantity: 500
    },
    mktpStoreRentStatus: {
        Normal: 2000,
        DateExpire: 3000,
        ManualStop: 4000
    },
    wmsHouseCostRuleType: {
        Circle: 100,
        Quantity: 500
    },
    wmsCostItemType: {
        House: 100
    },
    wmsHouseType: {
        MerchantPublic: 100,
        MerchantPrivate: 200
    },
    wmsHouseTemperatureType: {
        Normal: 1000,
        Special: 2000
    },
    wmsHouseRentStatus: {
        Normal: 2000,
        DateExpire: 3000,
        ManualStop: 4000
    },
    detentionNoticeType: { NoNotice: 100, Once: 1000, EveryDay: 2000 },
    wmsStockAdjustAction: {
        Deduct: 100,
        Deposit: 200
    },
    wmsStockAdjustOrderStatus: {
        WaitApprove: 1000,
        WaitExec: 2000,
        CloseComplete: 8100,
        CloseCancel: 8200
    },
    wmsTransferOrderStatus: {
        Create: 1000,
        WaitConsignAck: 1500,
        TransferWorking: 4000,
        CloseTransferPart: 5000,
        CloseTransferOK: 6000,
        CloseTransferNo: 6500,
        CloseStockExp: 7500,
        CloseConsignFail: 8000
    },
    scPurchaseUnitType: { Common: 1000, Supplier: 2000 },
    scPurchaseSupplierType: {
        Inner: 100,
        External: 200
    },
    scPurchaseSupplierStatus: {
        Check: 100,
        Corporate: 200,
        Stop: 300
    },
    scSaleOrderStatus: {
        WaitSubmit: 1000,
        WaitProve: 2000,
        WaitShip: 3000,
        WaitReceive: 4000,
        WaitReceipt: 5000,
        WaitPay: 6000,
        CloseCancel: 12000,
        CloseComplete: 13000
    },
    scSaleCustomerType: {
        Inner: 100,
        External: 200
    },
    scPurchaseOrderStatus: {
        Draft: 1000,
        Create: 2000,
        Prove: 3000,
        WareCheck: 6000,
        Receipt: 7000,
        CancelClose: 12000,
        CompleteClose: 13000
    },
    tmsDeliveryConsignType: {
        Delivery: 1000,
        Back: 2000
    },
    tmsDeliveryConsignStatus: {
        WaitCollect: 1000,
        WaitCorpDispatch: 2000,
        CorpAckOk: 4000,
        CloseComplete: 6000,
        CloseManualCancel: 7000,
        CloseBizCancel: 8000,
        CloseBizClose: 9000
    },
    tmsDeliveryOrderStatus: {
        WaitPlanCorp: 1000,
        WaitCorpAck: 1500,
        CorpAckOK: 2000,
        CorpAckFail: 2500,
        CorpWorking: 3000,
        CloseComplete: 6000,
        ClosePlanFail: 7000,
        CloseBizCancel: 9000
    },
    tmsDeliveryCorpType: {
        Platform: 1000,
        Self: 2000,
        DiDiHuoYun: 3000,
        HuoCheBang: 4000,
        HuoLaLa: 5000
    }
};
