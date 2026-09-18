// components/ui/__tests__/Loading.test.tsx
import { render, screen } from "@testing-library/react";
import Loading from "../Loading";

describe("Loading", () => {
  it("renders the default label when none is given", () => {
    render(<Loading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders a custom label when one is given", () => {
    render(<Loading label="Loading events…" />);
    expect(screen.getByText("Loading events…")).toBeInTheDocument();
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});
