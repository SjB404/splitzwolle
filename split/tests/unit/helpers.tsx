import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import MotionProvider from "./motionProvider.tsx";

export function renderWithMotion(ui: ReactElement) {
  return render(<MotionProvider>{ui}</MotionProvider>);
}

export function renderWithRouter(ui: ReactElement, route = "/") {
  return render(
    <MotionProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MotionProvider>,
  );
}
