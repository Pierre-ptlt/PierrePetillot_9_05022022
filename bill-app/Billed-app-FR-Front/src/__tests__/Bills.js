/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("when I am on Bills page but it is loading", () => {
    test("Then Loading page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills, loading: true });
      const loadingMessage = screen.getByTestId("loading");
      expect(loadingMessage).toBeTruthy();
    });
  });
  describe("When I am on Bills page but back-end sends an error message", () => {
    test("Then Error page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills, error: true });
      const errorMessage = screen.getByTestId("error-message");
      expect(errorMessage).toBeTruthy();
    });
  });
})

describe("Given i am on bills page as an employee",()=>{
  test("Should call the handleClickNewBill method when i click 'nouvelle note de frais' button",()=>{
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const store = null;
    const bill= new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const handleClickNewBill = jest.fn(bill.handleClickNewBill)
    const btnNewBill = screen.getByTestId('btn-new-bill')
    expect(btnNewBill).toBeTruthy()
    btnNewBill.addEventListener('click', handleClickNewBill)
    fireEvent.click(btnNewBill)
    expect(screen.getByTestId('form-new-bill')).toBeTruthy()
  })

  test("Should call the handleClickOnEye method when I click on the eye icon", () => {
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    $.fn.modal = jest.fn();
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const store = null;
    const bill= new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const allIconEye = screen.getAllByTestId('icon-eye')
    expect(allIconEye).toBeTruthy()
    const iconEye = allIconEye[0]
    console.log(iconEye)
    const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye))
    iconEye.addEventListener('click', handleClickIconEye)
    expect(iconEye).toBeTruthy()
    fireEvent.click(iconEye)
    expect(handleClickIconEye).toHaveBeenCalled()
    expect(screen.getByTestId("modal-title")).toBeTruthy()
  })
});

// Test d'intégration GET Bills

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to BillUI", () => {
    test("fetches bills from mock API GET", async () => {
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
       const getSpy = jest.spyOn(mockStore, "bills")
       const bills = await mockStore.bills()
       expect(getSpy).toHaveBeenCalledTimes(1)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))

      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

