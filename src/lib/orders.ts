
import { supabase } from "./supabase";
import { cleanProductName } from "./utils";

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

export const saveOrderToDb = async (
    customerInfo: { name: string; phone: string; address?: string; notes?: string },
    items: OrderItem[],
    totalPrice: number,
    status: string = "pending"
) => {
    try {
        console.log("Saving order to Supabase...", { customerInfo, totalPrice });

        const roundedTotal = Math.round(Number(totalPrice) * 100) / 100;

        // 1. Standard Insert
        const { data: orders, error: orderError } = await supabase
            .from("orders")
            .insert([{
                customer_name: customerInfo.name || "عميل",
                customer_phone: customerInfo.phone || "010",
                customer_address: customerInfo.address || "طلب عبر المتجر",
                total_price: roundedTotal
            }])
            .select();

        if (orderError || !orders || orders.length === 0) {
            console.error("Supabase First Attempt Failed:", orderError);

            // 2. Minimal Fallback (only absolute essentials)
            const { data: fallback, error: fallbackError } = await supabase
                .from("orders")
                .insert([{
                    customer_name: "طلب سريع",
                    customer_phone: "000",
                    total_price: roundedTotal
                }])
                .select();

            if (fallbackError || !fallback || fallback.length === 0) {
                console.error("Supabase Second Attempt Failed:", fallbackError);
                return { success: false, error: "Database save failed" };
            }

            return { success: true, orderId: fallback[0].id };
        }

        const order = orders[0];

        // 2. Try to insert items (even if this fails, we have the order record)
        try {
            const orderItems = items.map((item) => ({
                order_id: order.id,
                product_name: cleanProductName(item.name || "منتج"),
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
            }));

            await supabase.from("order_items").insert(orderItems);
        } catch (itemErr) {
            console.error("Order items save failed, but order was saved:", itemErr);
        }

        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error("Fatal catch-all order save error:", error);
        return { success: false, error: error.message };
    }
};
