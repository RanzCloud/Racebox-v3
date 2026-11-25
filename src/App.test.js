import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: "Australian Grand Prix",
            season: 2025,
            date: "2025-03-16",
            location: "Melbourne",
            winner: "Lando Norris",
          },
        ]),
    })
  );
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders the app heading and race calendar", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: "RaceBoxd" })).toBeInTheDocument();
  expect((await screen.findAllByText(/Australian Grand Prix/i)).length).toBeGreaterThan(0);
});

test("opens mobile settings and saves preference changes", async () => {
  render(<App />);
  await screen.findAllByText(/Australian Grand Prix/i);
  fireEvent.click(screen.getByRole("button", { name: "Open app settings" }));
  expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Mobile/ }));
  const haptics = screen.getByRole("checkbox", { name: /Haptic feedback/ });
  fireEvent.click(haptics);
  expect(JSON.parse(localStorage.getItem("raceboxd-settings"))).toMatchObject({ haptics: false });
});
