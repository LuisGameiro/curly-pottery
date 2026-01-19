// import {
//   getAllOrders,
//   getOrderById,
//   createOrder,
//   updateOrderStatus,
// } from "../../actions/order.actions";
// import { revalidatePath } from "next/cache";

// // Centralized prisma mock used by jest.mock factory
// const prismaMock = {
//   order: {
//     findMany: jest.fn(),
//     findUnique: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//   },
// };

// jest.mock("prisma/prisma", () => ({
//   prisma: prismaMock,
// }));

// jest.mock("next/cache", () => ({
//   revalidatePath: jest.fn(),
// }));

// // Minimal helpers / fixtures
// const fakeUser = { id: "user-1", email: "user@example.com" } as any;
// const baseOrder = {
//   id: "order-1",
//   userId: "user-1",
//   status: "PENDING",
//   lineItems: [],
//   discounts: [],
//   subtotalPrice: 10,
//   totalPrice: 15,
//   currency: "GBP",
//   shippingPrice: 5,
//   shippingMethod: "Standard",
//   shippingAddress: {},
//   billingAddress: {},
//   createdAt: new Date("2025-01-01T00:00:00Z"),
//   updatedAt: new Date("2025-01-01T00:00:00Z"),
// } as any;

// beforeEach(() => {
//   jest.clearAllMocks();
// });

// describe("getAllOrders", () => {
//   it("returns orders with users and uses correct query options", async () => {
//     const withUser = { ...baseOrder, user: fakeUser };
//     prismaMock.order.findMany.mockResolvedValueOnce([withUser]);

//     const res = await getAllOrders();

//     expect(prismaMock.order.findMany).toHaveBeenCalledTimes(1);
//     expect(prismaMock.order.findMany).toHaveBeenCalledWith({
//       orderBy: { createdAt: "desc" },
//       include: { user: true },
//     });

//     expect(res).toEqual({
//       success: true,
//       message: "Fetched all orders successfully",
//       data: [withUser],
//     });
//   });

//   it("handles prisma errors gracefully", async () => {
//     prismaMock.order.findMany.mockRejectedValueOnce(new Error("DB down"));

//     const res = await getAllOrders();

//     expect(res.success).toBe(false);
//     expect(res.message).toBe("DB down");
//     expect((res as any).errors).toBeInstanceOf(Error);
//   });
// });

// describe("getOrderById", () => {
//   it("returns a single order with user by id", async () => {
//     const withUser = { ...baseOrder, id: "order-42", user: fakeUser };
//     prismaMock.order.findUnique.mockResolvedValueOnce(withUser);

//     const res = await getOrderById("order-42");

//     expect(prismaMock.order.findUnique).toHaveBeenCalledTimes(1);
//     expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
//       where: { id: "order-42" },
//       include: { user: true },
//     });

//     expect(res).toEqual({
//       success: true,
//       message: "Fetched order successfully",
//       data: withUser,
//     });
//   });

//   it("surfaces errors from prisma as ActionResponse failure", async () => {
//     prismaMock.order.findUnique.mockRejectedValueOnce(new Error("Not found"));

//     const res = await getOrderById("missing");

//     expect(res.success).toBe(false);
//     expect(res.message).toBe("Not found");
//     expect((res as any).errors).toBeInstanceOf(Error);
//   });
// });

// describe("createOrder", () => {
//   it("creates order with defaults, pending status, and optional user connect", async () => {
//     const created = { ...baseOrder, id: "created-1" };
//     prismaMock.order.create.mockResolvedValueOnce(created);

//     const input = {
//       cartId: "cart-1",
//       userId: "user-1",
//       shippingAddress: { city: "X" },
//       billingAddress: { city: "Y" },
//       // Provide a minimal cart; the action applies defaults and coercions
//       cart: {
//         lineItems: [],
//         discounts: [],
//         subtotalPrice: "10" as unknown as number,
//         totalPrice: "15" as unknown as number,
//         currency: undefined as unknown as string,
//       } as any,
//       // Although not declared in the function's input type, the action currently
//       // reads these properties; include them to assert pass-through behavior
//       shippingPrice: 5,
//       shippingMethod: "Standard",
//     } as any; // cast to any to avoid excess property checks in test

//     const res = await createOrder(input);

//     expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
//     expect(prismaMock.order.create).toHaveBeenCalledWith({
//       data: expect.objectContaining({
//         lineItems: [],
//         discounts: [],
//         subtotalPrice: 10,
//         totalPrice: 15,
//         currency: "GBP", // default when undefined
//         shippingAddress: { city: "X" },
//         billingAddress: { city: "Y" },
//         status: "PENDING",
//         shippingPrice: 5,
//         shippingMethod: "Standard",
//         user: { connect: { id: "user-1" } },
//       }),
//     });

//     expect(res).toEqual({
//       success: true,
//       message: "Order created successfully",
//       data: created,
//     });
//   });

//   it("propagates prisma errors as ActionResponse failure", async () => {
//     prismaMock.order.create.mockRejectedValueOnce(new Error("Write failed"));

//     const res = await createOrder({
//       cartId: "cart-err",
//       shippingAddress: {},
//       billingAddress: {},
//       cart: { lineItems: [], discounts: [], subtotalPrice: 0, totalPrice: 0 },
//     } as any);

//     expect(res.success).toBe(false);
//     expect(res.message).toBe("Write failed");
//     expect((res as any).errors).toBeInstanceOf(Error);
//   });
// });

// describe("updateOrderStatus", () => {
//   it("uppercases status, updates order, and revalidates path", async () => {
//     prismaMock.order.update.mockResolvedValueOnce({
//       ...baseOrder,
//       status: "PAID",
//     });

//     const res = await updateOrderStatus("order-1", "paid");

//     expect(prismaMock.order.update).toHaveBeenCalledTimes(1);
//     expect(prismaMock.order.update).toHaveBeenCalledWith({
//       where: { id: "order-1" },
//       data: { status: "PAID" },
//     });

//     expect(revalidatePath).toHaveBeenCalledTimes(1);
//     expect(revalidatePath).toHaveBeenCalledWith("/admin/orders");

//     expect(res).toEqual({
//       success: true,
//       message: "Updated order status successfully",
//       data: expect.objectContaining({ status: "PAID" }),
//     });
//   });

//   it("returns failure response when update throws", async () => {
//     prismaMock.order.update.mockRejectedValueOnce(new Error("Update failed"));

//     const res = await updateOrderStatus("order-1", "shipped");

//     expect(res.success).toBe(false);
//     expect(res.message).toBe("Update failed");
//     expect((res as any).errors).toBeInstanceOf(Error);
//   });
// });
