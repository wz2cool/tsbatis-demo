import { column, TableEntity } from "tsbatis";

export class Order extends TableEntity {
    @column("id", true, false)
    public id: number;
    @column("employee_id")
    public employeeId: number;
    @column("customer_id")
    public customerId: number;
    @column("order_date")
    public orderDate: Date;
    @column("shipped_date")
    public shippedDate: Date;
    @column("shipper_id")
    public shipperId: number;
    @column("ship_name")
    public shipName: string;
    @column("ship_address")
    public shipAddress: string;
    @column("ship_city")
    public shipCity: string;
    @column("ship_state_province")
    public shipStateProvince: string;
    @column("ship_zip_postal_code")
    public shipZipPostalCode: number;
    @column("ship_country_region")
    public shipCountryRegion: string;
    @column("shipping_fee")
    public shippingFee: number;
    @column("taxs")
    public taxes: number;
    @column("payment_type")
    public paymentType: string;
    @column("paid_date")
    public paidDate: Date;
    @column("notes")
    public notes: string;
    @column("tax_rate")
    public taxRate: number;
    @column("tax_status_id")
    public taxStatusId: number;
    @column("status_id")
    public statusId: number;

    public getTableName(): string {
        return "orders";
    }
}
