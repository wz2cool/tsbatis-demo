import { column, TableEntity } from "tsbatis";

export class Product extends TableEntity {
    @column("id", true, true)
    public id: number;
    @column("supplier_ids")
    public supplierIds: string;
    @column("product_code")
    public productCode: string;
    @column("product_name")
    public productName: string;
    @column("description")
    public description: string;
    @column("standard_cost")
    public standardCost: number;
    @column("list_price")
    public listPrice: number;
    @column("reorder_level")
    public reorderLevel: number;
    @column("target_level")
    public targetLevel: number;
    @column("quantity_per_unit")
    public quantityPerUnit: string;
    @column("discontinued")
    public discontinued: number;
    @column("minimum_reorder_quantity")
    public minimumReorderQuantity: number;
    @column("category")
    public category: string;

    public getTableName(): string {
        return "products";
    }
}
