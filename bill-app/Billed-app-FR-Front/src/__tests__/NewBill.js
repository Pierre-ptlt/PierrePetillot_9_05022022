/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI  from '../views/BillsUI.js'
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes";
import router from "../app/Router.js";
window.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("When I want to upload a file, handleChangeFile is called", () =>
    {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage : window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const uploadButton = screen.getByTestId("file"); // On récupère le bouton d'upload de document
      uploadButton.addEventListener('click', handleChangeFile);
      fireEvent.click(uploadButton);
      expect(handleChangeFile).toHaveBeenCalled(); // On vérifie que cliquer sur le bouton a bien appelé la fonction
    })

    test("handleSubmit is called when form is submitted",() =>
    {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const store = null;
      const newBill = new NewBill({
        document, onNavigate, store, localStorage : window.localStorage
      })
      expect(newBill).toBeDefined();
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})


// test d'intégration POST
describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("add bill to mock API POST", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
     const store = mockStore;
     const newBill = new NewBill({
       document, onNavigate, store, localStorage : window.localStorage
     })
     const testBill =
      {
        "id": "BeKy598729423xZ",
        "vat": "30",
        "amount": 150,
        "name": "test post newbill",
        "fileName": "15927.jpeg",
        "commentary": "test post newbill",
        "pct": 20,
        "type": "Transports",
        "email": "a@a",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a798b",
        "date": "2022-02-14",
        "status": "pending",
        "commentAdmin": "en fait non"
      } // On créé une Bill de test

      const getSpy = jest.spyOn(mockStore, "bills") // On simule l'appel de la fonction "bills" du store, exportée par défaut
      const bill = await mockStore.bills().update(testBill); // On poste les données via la fonction "update" de la fonction "bills" (marche aussi avec create, les deux font POST)
      expect(getSpy).toHaveBeenCalledTimes(1)
      console.log(bill)
      console.log(bill.bill.id)
      expect(bill.bill.status).toBe("pending")
      expect(bill.bill.id).toBe("BeKy598729423xZ") // On vérifie que les données envoyées au store sont correctes
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})