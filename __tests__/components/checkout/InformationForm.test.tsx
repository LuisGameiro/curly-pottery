// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import InformationForm from "@components/checkout/InformationForm";

// /**
//  * Behaviors covered:
//  * 1. Prompts sign-in and guest option when not logged in
//  * 2. Switches to form when clicking Continue as Guest
//  * 3. Renders form immediately when logged in
//  * 4. Prefills email and phone from initialData
//  * 5. Submits form and passes FormData to onComplete
//  */

// describe("InformationForm", () => {
//   function renderGuest(
//     onComplete = jest.fn(),
//     initialData: any = {},
//     isLoggedIn = false,
//   ) {
//     return render(
//       <InformationForm
//         onComplete={onComplete}
//         initialData={initialData}
//         isLoggedIn={isLoggedIn}
//       />,
//     );
//   }

//   it("prompts sign-in and guest option when not logged in", () => {
//     renderGuest();
//     expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /Sign In/i }),
//     ).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /Continue as Guest/i }),
//     ).toBeInTheDocument();
//   });

//   it("switches to form when clicking Continue as Guest", () => {
//     renderGuest();
//     fireEvent.click(screen.getByRole("button", { name: /Continue as Guest/i }));
//     expect(
//       screen.getByRole("button", { name: /Continue to Shipping/i }),
//     ).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
//   });

//   it("renders form immediately when logged in", () => {
//     renderGuest(jest.fn(), {}, true);
//     expect(
//       screen.getByRole("button", { name: /Continue to Shipping/i }),
//     ).toBeInTheDocument();
//   });

//   it("prefills email and phone from initialData", () => {
//     const initialData = { email: "user@example.com", phone: "+123456789" };
//     renderGuest(jest.fn(), initialData, true);
//     const email = screen.getByPlaceholderText(
//       /Email Address/i,
//     ) as HTMLInputElement;
//     const phone = screen.getByPlaceholderText(/Phone/i) as HTMLInputElement;
//     expect(email.value).toBe("user@example.com");
//     expect(phone.value).toBe("+123456789");
//   });

//   it("submits form and passes FormData to onComplete", () => {
//     const onComplete = jest.fn();
//     renderGuest(onComplete, { email: "a@b.com", phone: "111" }, true);

//     fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
//       target: { value: "John" },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/Last Name/i), {
//       target: { value: "Doe" },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/Address/i), {
//       target: { value: "123 Street" },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/City/i), {
//       target: { value: "London" },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/Postcode/i), {
//       target: { value: "E1 1AA" },
//     });

//     fireEvent.submit(
//       screen
//         .getByRole("button", { name: /Continue to Shipping/i })
//         .closest("form")!,
//     );

//     expect(onComplete).toHaveBeenCalledTimes(1);
//     const formDataArg = onComplete.mock.calls[0][0] as FormData;
//     // Validate a couple of fields made it into FormData
//     expect(formDataArg.get("firstName")).toBe("John");
//     expect(formDataArg.get("lastName")).toBe("Doe");
//     expect(formDataArg.get("address")).toBe("123 Street");
//     expect(formDataArg.get("city")).toBe("London");
//     expect(formDataArg.get("postcode")).toBe("E1 1AA");
//   });
// });
