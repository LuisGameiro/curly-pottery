/**
 * @jest-environment jsdom
 */

import React from "react";
import ReactDOM from "react-dom";

// Mock external UI library to avoid pulling full implementations/styles
jest.mock("@components/ui", () => ({
  Container: ({ children, ...rest }: any) => (
    <div data-mock="Container" {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: any) => (
    <div data-mock="Text" {...rest}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icon to a simple span to validate class changes
jest.mock("lucide-react", () => ({
  ChevronDown: ({ className = "" }: { className?: string }) => (
    <span data-testid="chevron" className={className} />
  ),
}));

import ClientFAQ from "../../../../app/faq/ClientFaq";

function click(el: Element) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("ClientFAQ", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.render(<ClientFAQ />, container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it("renders all questions collapsed initially", () => {
    const answers = Array.from(container.querySelectorAll('[data-mock="Text"]'))
      // Filter to those that look like answers by searching for known substrings
      .filter(
        (node) =>
          node.textContent?.includes("Royal Mail") ||
          node.textContent?.includes("refund or return"),
      );

    expect(answers.length).toBe(0);
  });

  it("expands an answer when its question is clicked", () => {
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);

    // Click the first question
    click(buttons[0]);

    // Now the first answer substring should be present
    expect(container.textContent).toContain("Royal Mail");
  });

  it("collapses the answer when the same question is clicked again", () => {
    const buttons = container.querySelectorAll("button");

    // Open then close
    click(buttons[0]);
    expect(container.textContent).toContain("Royal Mail");

    click(buttons[0]);

    // After collapsing, the text should no longer be present
    expect(container.textContent).not.toContain("Royal Mail");
  });

  it("only allows one item to be open at a time", () => {
    const buttons = container.querySelectorAll("button");

    // Open first
    click(buttons[0]);
    expect(container.textContent).toContain("Royal Mail");

    // Open second
    click(buttons[1]);
    expect(container.textContent).toContain("refund or return");
    // First should be closed now
    expect(container.textContent).not.toContain("Royal Mail");
  });

  it("rotates the chevron icon when an item is open", () => {
    const buttons = container.querySelectorAll("button");

    // The chevron is inside each button; check first button's chevron before/after click
    const firstChevron = buttons[0].querySelector('[data-testid="chevron"]');
    expect(firstChevron).toBeTruthy();
    expect(firstChevron?.className).not.toContain("rotate-180");

    click(buttons[0]);

    // After opening, the chevron should have rotate-180
    const firstChevronAfter = buttons[0].querySelector(
      '[data-testid="chevron"]',
    );
    expect(firstChevronAfter?.className).toContain("rotate-180");
  });
});
