
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
    status: string = "pending",
    couponCode: string = "",
    discountAmount: number = 0
) => {
    try {
        console.log("Saving order to DB...", { customerInfo, totalPrice, itemCount: items.length });

        const roundedTotal = Math.round(Number(totalPrice || 0) * 100) / 100;
        const roundedDiscount = Math.round(Number(discountAmount || 0) * 100) / 100;

        // 1. Prepare Order Data
        const orderData = {
            customer_name: customerInfo.name || "عميل واتساب",
            customer_phone: customerInfo.phone || "010",
            customer_address: customerInfo.address || "طلب عبر المتجر",
            customer_notes: customerInfo.notes || "",
            total_price: roundedTotal,
            coupon_code: couponCode || "",
            discount_amount: roundedDiscount,
            status: status || "pending",
        };

        // 2. Insert Order
        const { data: orders, error: orderError } = await supabase
            .from("orders")
            .insert([orderData])
            .select();

        if (orderError) {
            console.error("Supabase Order Insert Error:", orderError);
            throw orderError;
        }

        if (!orders || orders.length === 0) {
            throw new Error("No order data returned from Supabase");
        }

        const order = orders[0];
        console.log("Order saved successfully, ID:", order.id);

        // 3. Insert Order Items
        if (items && items.length > 0) {
            const orderItems = items.map((item) => ({
                order_id: order.id,
                product_id: Number(item.id) || null,
                product_name: cleanProductName(item.name || "منتج"),
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) {
                console.error("Order items save failed (non-blocking):", itemsError);
                // We don't fail the whole operation if only items fail
            }
        }

        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error("Fatal order save error:", error);
        
        // Final fallback (try to save even with minimal data if something above failed)
        try {
            const roundedTotal = Math.round(Number(totalPrice || 0) * 100) / 100;
            const { data: fallback, error: fallbackError } = await supabase
                .from("orders")
                .insert([{
                    customer_name: (customerInfo.name || "عميل") + " (فشل تقني)",
                    customer_phone: customerInfo.phone || "000",
                    customer_address: customerInfo.address || "غير محدد",
                    total_price: roundedTotal,
                    status: 'pending'
                }])
                .select();
                
            if (!fallbackError && fallback && fallback.length > 0) {
                return { success: true, orderId: fallback[0].id };
            }
        } catch (e) {
            console.error("Ultimate fallback failed:", e);
        }

        return { success: false, error: error.message || "حدث خطأ أثناء حفظ الطلب" };
    }
};
