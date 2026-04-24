import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createHtmlPlugin } from "vite-plugin-html";
import injectHTML from "vite-plugin-html-inject";
import { resolve } from "path";

// Common injection script for all pages
const INJECT_SCRIPT = '<script src="./inject.js"></script>';

// Helper function to create page configuration
const createPageConfig = (filename, entry, template, inject_page_title) => ({
    filename,
    entry,
    template,
    injectOptions: {
        data: {
            inject_page_title,
            injectScript: INJECT_SCRIPT
        }
    }
});

const htmlParams = {
    minify: true,
    pages: [
        // Main entry
        createPageConfig("index", "/src/main.js", "index.html", "森博软件"),

        // MD Module - Tenant & Account
        createPageConfig(
            "pc/md/tenant_regist.html",
            "/src/md/tenant_regist/main.js",
            "/pc/md/tenant_regist.html",
            "商户注册"
        ),
        createPageConfig(
            "pc/md/account_login.html",
            "/src/md/account_login/main.js",
            "/pc/md/account_login.html",
            "账户登入"
        ),
        createPageConfig(
            "pc/md/login_history",
            "/src/md/login_history/main.js",
            "/pc/md/login_history.html",
            "登入历史"
        ),
        createPageConfig(
            "md_account",
            "/src/md/account/main.js",
            "/pc/md/account.html",
            "账号列表"
        ),
        createPageConfig(
            "md_auth_role",
            "/src/md/auth_role/main.js",
            "/pc/md/auth_role.html",
            "角色列表"
        ),
        createPageConfig(
            "md_department",
            "/src/md/department/main.js",
            "/pc/md/department.html",
            "部门管理"
        ),
        createPageConfig(
            "md_employee",
            "/src/md/employee/main.js",
            "/pc/md/employee.html",
            "人员列表"
        ),
        createPageConfig(
            "md_position",
            "/src/md/position/main.js",
            "/pc/md/position.html",
            "岗位信息"
        ),
        createPageConfig(
            "md_merchant",
            "/src/md/merchant/main.js",
            "/pc/md/merchant.html",
            "商户管理"
        ),

        // MD Module - Material Management
        createPageConfig(
            "md_material",
            "/src/md/material/main.js",
            "/pc/md/material.html",
            "物料列表"
        ),
        createPageConfig(
            "md_material_unit",
            "/src/md/material_unit/main.js",
            "/pc/md/material_unit.html",
            "基本单位"
        ),
        createPageConfig(
            "md_material_spec_type",
            "/src/md/material_spec_type/main.js",
            "/pc/md/material_spec_type.html",
            "规格分类"
        ),
        createPageConfig(
            "md_material_spec_value",
            "/src/md/material_spec_value/main.js",
            "/pc/md/material_spec_value.html",
            "规格明细"
        ),
        createPageConfig(
            "md_spec_material",
            "/src/md/spec_material/main.js",
            "/pc/md/spec_material.html",
            "物料规格"
        ),
        createPageConfig(
            "md_material_catalog",
            "/src/md/material_catalog/main.js",
            "/pc/md/material_catalog.html",
            "物料类目"
        ),

        // WMS Module - Stock Management
        createPageConfig(
            "wms_stock_unit",
            "/src/wms/stock_unit/main.js",
            "/pc/wms/stock_unit.html",
            "库存单位"
        ),
        createPageConfig(
            "wms_stock_unit_conversion",
            "/src/wms/stock_unit_conversion/main.js",
            "/pc/wms/stock_unit_conversion.html",
            "库存单位转换"
        ),
        createPageConfig(
            "wms_stock_batch_group",
            "/src/wms/stock_batch_group/main.js",
            "/pc/wms/stock_batch_group.html",
            "批次分组"
        ),
        createPageConfig(
            "wms_stock_secure_num",
            "/src/wms/stock_secure_num/main.js",
            "/pc/wms/stock_secure_num.html",
            "安全库存"
        ),
        createPageConfig(
            "wms_stock_center",
            "/src/wms/stock_center/main.js",
            "/pc/wms/stock_center.html",
            "库存中心"
        ),
        createPageConfig(
            "wms_stock_history",
            "/src/wms/stock_history/main.js",
            "/pc/wms/stock_history.html",
            "库存流水"
        ),
        createPageConfig(
            "wms_stock_transfer",
            "/src/wms/stock_transfer/main.js",
            "/pc/wms/stock_transfer.html",
            "调拨单"
        ),
        createPageConfig(
            "wms_stock_adjust",
            "/src/wms/stock_adjust/main.js",
            "/pc/wms/stock_adjust.html",
            "库调单"
        ),

        // SC Module - Sales & Purchase
        createPageConfig(
            "scm_sale_customer",
            "/src/scm/sale_customer/main.js",
            "/pc/scm/sale_customer.html",
            "客户管理"
        ),
        createPageConfig(
            "scm_sale_unit",
            "/src/scm/sale_unit/main.js",
            "/pc/scm/sale_unit.html",
            "销售单位"
        ),
        createPageConfig(
            "scm_sale_relation",
            "/src/scm/sale_relation/main.js",
            "/pc/scm/sale_relation.html",
            "外供关系"
        ),
        createPageConfig(
            "scm_sale_order",
            "/src/scm/sale_order/main.js",
            "/pc/scm/sale_order.html",
            "销售订单"
        ),
        createPageConfig(
            "scm_purchase_supplier",
            "/src/scm/purchase_supplier/main.js",
            "/pc/scm/purchase_supplier.html",
            "供应商管理"
        ),
        createPageConfig(
            "scm_supplier_material",
            "/src/scm/supplier_material/main.js",
            "/pc/scm/supplier_material.html",
            "供应商物料"
        ),
        createPageConfig(
            "scm_purchase_unit",
            "/src/scm/purchase_unit/main.js",
            "/pc/scm/purchase_unit.html",
            "采购单位"
        ),
        createPageConfig(
            "scm_purchase_relation",
            "/src/scm/purchase_relation/main.js",
            "/pc/scm/purchase_relation.html",
            "采购关系"
        ),
        createPageConfig(
            "scm_purchase_order",
            "/src/scm/purchase_order/main.js",
            "/pc/scm/purchase_order.html",
            "采购订单"
        ),

        // MKTP Module - Market Management
        createPageConfig("mktp_gate", "/src/mktp/gate/main.js", "/pc/mktp/gate.html", "入场门岗"),
        createPageConfig(
            "mktp_cost_item",
            "/src/mktp/cost_item/main.js",
            "/pc/mktp/cost_item.html",
            "费用科目"
        ),
        createPageConfig("mktp_ware", "/src/mktp/ware/main.js", "/pc/mktp/ware.html", "入场货品"),
        createPageConfig(
            "mktp_ware_category",
            "/src/mktp/ware_category/main.js",
            "/pc/mktp/ware_category.html",
            "货品类目"
        ),
        createPageConfig(
            "mktp_ware_unit",
            "/src/mktp/ware_unit/main.js",
            "/pc/mktp/ware_unit.html",
            "货品单位"
        ),
        createPageConfig(
            "mktp_admission_cost_standard",
            "/src/mktp/admission_cost_standard/main.js",
            "/pc/mktp/admission_cost_standard.html",
            "计费标准"
        ),
        createPageConfig(
            "mktp_admission_cost",
            "/src/mktp/admission_cost/main.js",
            "/pc/mktp/admission_cost.html",
            "入场管理"
        ),
        createPageConfig(
            "mktp_store_center",
            "/src/mktp/store_center/main.js",
            "/pc/mktp/store_center.html",
            "商铺中心"
        ),
        createPageConfig(
            "mktp_store_region",
            "/src/mktp/store_region/main.js",
            "/pc/mktp/store_region.html",
            "库区配置"
        ),
        createPageConfig(
            "mktp_store",
            "/src/mktp/store/main.js",
            "/pc/mktp/store.html",
            "商铺列表"
        ),
        createPageConfig(
            "mktp_store_rent",
            "/src/mktp/store_rent/main.js",
            "/pc/mktp/store_rent.html",
            "租赁管理"
        ),
        createPageConfig(
            "mktp_store_cost",
            "/src/mktp/store_cost/main.js",
            "/pc/mktp/store_cost.html",
            "费用管理"
        ),
        createPageConfig(
            "mktp_store_meter_data",
            "/src/mktp/store_meter_data/main.js",
            "/pc/mktp/store_meter_data.html",
            "水电抄表"
        ),
        createPageConfig(
            "mktp_weight_cost_standard",
            "/src/mktp/weight_cost_standard/main.js",
            "/pc/mktp/weight_cost_standard.html",
            "计费标准"
        ),
        createPageConfig(
            "mktp_weight_cost",
            "/src/mktp/weight_cost/main.js",
            "/pc/mktp/weight_cost.html",
            "过秤计费"
        ),
        createPageConfig(
            "mktp_other_cost",
            "/src/mktp/other_cost/main.js",
            "/pc/mktp/other_cost.html",
            "各项杂费"
        ),

        // WMS Module - House Management
        createPageConfig(
            "wms_cost_item",
            "/src/wms/cost_item/main.js",
            "/pc/wms/cost_item.html",
            "费用科目"
        ),
        createPageConfig(
            "wms_stock_adjust_time_range",
            "/src/wms/stock_adjust_time_range/main.js",
            "/pc/wms/stock_adjust_time_range.html",
            "库调时段"
        ),
        createPageConfig(
            "wms_house_center",
            "/src/wms/house_center/main.js",
            "/pc/wms/house_center.html",
            "仓库中心"
        ),
        createPageConfig(
            "wms_house_region",
            "/src/wms/house_region/main.js",
            "/pc/wms/house_region.html",
            "库区配置"
        ),
        createPageConfig("wms_house", "/src/wms/house/main.js", "/pc/wms/house.html", "仓库列表"),
        createPageConfig(
            "wms_house_rack",
            "/src/wms/house_rack/main.js",
            "/pc/wms/house_rack.html",
            "库位列表"
        ),
        createPageConfig(
            "wms_house_tag",
            "/src/wms/house_tag/main.js",
            "/pc/wms/house_tag.html",
            "仓库标签"
        ),
        createPageConfig(
            "wms_house_rent",
            "/src/wms/house_rent/main.js",
            "/pc/wms/house_rent.html",
            "租赁管理"
        ),
        createPageConfig(
            "wms_house_cost",
            "/src/wms/house_cost/main.js",
            "/pc/wms/house_cost.html",
            "租赁费用"
        ),
        createPageConfig(
            "wms_house_meter_data",
            "/src/wms/house_meter_data/main.js",
            "/pc/wms/house_meter_data.html",
            "抄表录入"
        ),

        // TMS Module - Delivery Management
        createPageConfig(
            "pc/tms/delivery_time_range",
            "/src/tms/delivery_time_range/main.js",
            "/pc/tms/delivery_time_range.html",
            "运输时段"
        ),
        createPageConfig(
            "pc/tms/delivery_vehicle_spec",
            "/src/tms/delivery_vehicle_spec/main.js",
            "/pc/tms/delivery_vehicle_spec.html",
            "运输规格"
        ),
        createPageConfig(
            "pc/tms/delivery_vehicle_type",
            "/src/tms/delivery_vehicle_type/main.js",
            "/pc/tms/delivery_vehicle_type.html",
            "运输车型"
        ),
        createPageConfig(
            "pc/tms/delivery_consign",
            "/src/tms/delivery_consign/main.js",
            "/pc/tms/delivery_consign.html",
            "运输委托"
        ),
        createPageConfig(
            "tms_delivery_self_driver",
            "/src/tms/self_driver/main.js",
            "/pc/tms/self_driver.html",
            "司机管理"
        ),
        createPageConfig(
            "tms_delivery_self_vehicle",
            "/src/tms/self_vehicle/main.js",
            "/pc/tms/self_vehicle.html",
            "车辆管理"
        ),
        createPageConfig(
            "tms_delivery_self_vehicle_driver",
            "/src/tms/self_vehicle_driver/main.js",
            "/pc/tms/self_vehicle_driver.html",
            "车辆司机"
        ),
        createPageConfig(
            "tms_delivery_order",
            "/src/tms/delivery_order/main.js",
            "/pc/tms/delivery_order.html",
            "运输订单"
        ),
        createPageConfig(
            "tms_delivery_corp",
            "/src/tms/delivery_corp/main.js",
            "/pc/tms/delivery_corp.html",
            "承运商"
        ),
        createPageConfig(
            "tms_delivery_corp_time_range",
            "/src/tms/delivery_corp_time_range/main.js",
            "/pc/tms/delivery_corp_time_range.html",
            "承运商运输时段"
        ),

        // O2O Module
        createPageConfig(
            "o2o_member",
            "/src/o2o/member/main.js",
            "/pc/o2o/member.html",
            "会员列表"
        ),
        createPageConfig(
            "o2o_member_point",
            "/src/o2o/member_point/main.js",
            "/pc/o2o/member_point.html",
            "积分流水"
        ),
        createPageConfig(
            "o2o_member_wallet",
            "/src/o2o/member_wallet/main.js",
            "/pc/o2o/member_wallet.html",
            "储值流水"
        ),
        createPageConfig(
            "o2o_member_wallet_order",
            "/src/o2o/member_wallet_order/main.js",
            "/pc/o2o/member_wallet_order.html",
            "充值记录"
        ),
        createPageConfig("o2o_ware", "/src/o2o/ware/main.js", "/pc/o2o/ware.html", "货品列表"),
        createPageConfig(
            "o2o_ware_unit",
            "/src/o2o/ware_unit/main.js",
            "/pc/o2o/ware_unit.html",
            "货品单位"
        ),
        createPageConfig(
            "o2o_manual_service",
            "/src/o2o/manual_service/main.js",
            "/pc/o2o/manual_service.html",
            "服务列表"
        ),

        createPageConfig(
            "fin_order_pay",
            "/src/fin/order_pay/main.js",
            "/pc/fin/order_pay.html",
            "支付账款"
        ),
        createPageConfig(
            "pc/md/tenant_module",
            "/src/md/tenant_module/main.js",
            "/pc/md/tenant_module.html",
            "功能开关"
        )
    ]
};

// Generate Rollup input map from HTML pages
const rollupInputPages = Object.fromEntries(
    htmlParams.pages.map(page => [page.filename, page.template])
);

// https://vite.dev/config/
export default defineConfig({
    base: "/html", // 方便打包后预览
    publicDir: "public", // 默认 public
    server: {
        allowedHosts: true
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src")
        },
        loader: { ".js": "jsx" }
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    hack: `true; @import (reference) "${path.resolve("src/style/variables.less")}";`
                },
                math: "strict",
                javascriptEnabled: true
            }
        }
    },
    plugins: [
        vue(),
        vueJsx(),
        {
            ...injectHTML({
                tagName: "cxlloader",
                debug: {
                    logPath: true
                }
            }),
            enforce: "pre"
        },
        createHtmlPlugin(htmlParams)
    ],
    build: {
        minify: "terser",
        chunkSizeWarningLimit: 1600,
        cssCodeSplit: true,
        emptyOutDir: true,
        sourcemap: false,
        assetsDir: "assets", // 默认 assets
        outDir: "dist", // 默认 dist,
        assetsInlineLimit: 8192,
        rollupOptions: {
            input: rollupInputPages, // input 不用管，插件内会处理
            output: {
                compact: true,
                entryFileNames: "assert/js/[name]-[hash].js",
                chunkFileNames: "assert/js/[name]-[hash].js",
                assetFileNames: "assert/[ext]/[name].[hash].[ext]"
            }
        }
    },
    terserOptions: {
        compress: {
            drop_console: true,
            drop_debugger: true
        }
    }
});
