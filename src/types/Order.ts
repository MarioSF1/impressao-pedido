import { UUID } from "crypto";

export interface ItemOrder {
    id: number;
    item_id: number | null;
    name: string | null;
    quantity: number | null;
    unit_measure: string | null;
    price: number | null;
    note: string | null;
    comission: number | null;
    insurance_value: number | null;
    discount_value: number | null;
    shipping_value: number | null;
    other_value: number | null;
    subtotal: number | null;
    kit: boolean | null;
    parent_sales_order_item_id: number | null;
    kit_items: ItemOrder[] | null;
    order_id: number | null;
    purchase_order_number: string | null;
    purchase_order_item_number: string | null;
    // FISCAIS
    manual_tax_entry: boolean | null;
    cfop_code: string | null;
    ncm_code: string | null;
    tax_base_reduction_percentenge: number | null;
    tax_mva_percentage: number | null;
    deferment_percentage: number | null;
    // ICMS
    icms_tax_base: number | null;
    icms_cst: string | null;
    icms_tax_rate: number | null;
    icms_value: number | null;
    // ICMS ST
    icms_st_value: number | null;
    icms_st_tax_base: number | null;
    // IPI
    ipi_cst: string | null;
    ipi_tax_rate: number | null;
    ipi_tax_base: number | null;
    ipi_value: number | null;
    // PIS
    pis_cst: string | null;
    pis_tax_rate: number | null;
    pis_tax_base: number | null;
    pis_value: number | null;
    // COFINS
    cofins_cst: string | null;
    cofins_tax_rate: number | null;
    cofins_tax_base: number | null;
    cofins_value: number | null;
    // FCP
    fcp_tax_rate: number | null;
    fcp_tax_base: number | null;
    fcp_value: number | null;
    fcp_st_value: number | null;
}
  
export interface Order {
    id: number;
    number_order: number | null;
    type: 'order' | 'budget' | null;
    billing_date: Date | null;
    status: 'Em Digitação' | 'Enviado para Aprovação' | 'Orçamento Aprovado' | 'Orçamento Recusado' | 'Cancelado' | 'Aguardando Aprovação do Pedido' | 'Pedido Aprovado' | 'Em Produção' | 'Em Separação' | 'Faturado' | null;
    pickup: boolean | null;
    note: string | null;
    internal_notes: string | null;
    nfe_id: number | null;
    nfce_id: number | null;
    expiration_date: Date | null;
    cfop_code: string | null;
    last_update: Date | null;
    hash_id: UUID | null;
    items: ItemOrder[];
    holding: {
        id: number | null;
        client_id: string | null;
    };
    enterprise: {
        id: number | null;
        client_id: string | null;
    };
    shipping_mode: {
        id: number | null;
        description: string | null;
    };
    freight_modality: {
        id: number | null;
        description: string | null;
    };
    payment_method: {
        id: number | null;
        description: string | null;
    };
    sales_channel: {
        id: number | null;
        description: string | null;
    };
    client: {
        id: number | null;
        code: number | null;
        name: string | null;
        document: string | null;
        address: string | null;
        address_id: number | null;
        final_consumer: boolean | null;
        taxpayer: boolean | null;
    };
    carrier: {
        id: number | null;
        name: string | null;
        document: string | null;
        gross_weight_total: number | null;
        net_weight_total: number | null;
        volume_total: number | null;
        volume_unit: string | null;
    };
    seller: {
        id: number | null;
        name: string | null;
        document: string | null;
    };
    user: {
        id: number | null;
        email: string | null;
        name: string | null;
    };
    values: {
        discount_total: number | null;
        st_total: number | null;
        shipping_total: number | null;
        insurance_total: number | null;
        other_total: number | null;
        ipi_total: number | null;
        fcp_total: number | null;
        icms_total: number | null;
        pis_total: number | null;
        cofins_total: number | null;
        surchage_total: number | null;
        comission_discount: number | null;
        fcp_st_total: number | null;
        subtotal_value: number | null;
        total: number | null;
    };
}