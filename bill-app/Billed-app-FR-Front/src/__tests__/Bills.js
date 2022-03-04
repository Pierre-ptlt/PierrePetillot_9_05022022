/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId, fireEvent} from "@testing-library/dom"
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
      expect(screen.getByTestId("loading")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but backend sends an error message", () => {
    test("Then Error page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills, error: 'some error message' });
      expect(screen.getByTestId("error-message")).toBeTruthy();
    });
  });
})

describe("Given i am on bills page as an employee",()=>{
  test("When i click 'nouvelle note de frais' button, the handleClickNewBill method should be called",()=>{
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const store = null;
    const bill= new Bills({
      document, onNavigate, store, localStorage: window.localStorage // setup des variables de test
    })
    const handleClickNewBill = jest.fn(bill.handleClickNewBill) //recuperation de la fonction dans l'objet Bills créé au dessus
    const btnNewBill = screen.getByTestId('btn-new-bill') // recuperation du bouton
    expect(btnNewBill).toBeTruthy()
    btnNewBill.addEventListener('click', handleClickNewBill) // Cliquer sur le bouton lancera la fonction d'affichage du formulaire
    fireEvent.click(btnNewBill) // On clique sur le bouton
    expect(screen.getByTestId('form-new-bill')).toBeTruthy() // On vérifie que le formulaire NewBill est bien affiché
  })

  test("When the page is loaded, the getBills method should be called", () =>
  {
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    document.body.innerHTML = BillsUI({ data: bills })
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const store = mockStore;
    const bill= new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const getBills = jest.fn(bill.getBills)
    window.addEventListener('load', getBills) // La fonction se lance au chargement de la page
    fireEvent.load(window); // La page se charge
    expect(getBills).toHaveBeenCalled();
    expect(getBills).toBeTruthy();
    expect(screen.getByText("test1")).toBeTruthy(); // On vérifie que les Bills du mockStore sont bien affichées
  })

  test("When I click on the eye icon, the handleClickOnEye method should be called", () => {
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
    $.fn.modal = jest.fn(); // Sert à éviter l'erreur $(...).modal is not a function
    const allIconEye = screen.getAllByTestId('icon-eye') // On récupère toutes les icones oeil de la page
    expect(allIconEye).toBeTruthy()
    const iconEye = allIconEye[0] // On récupère la première icone oeil
    console.log(iconEye)
    const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye))
    iconEye.addEventListener('click', handleClickIconEye)
    expect(iconEye).toBeTruthy()
    fireEvent.click(iconEye)
    expect(handleClickIconEye).toHaveBeenCalled()
    expect(screen.getByTestId("modal-title")).toBeTruthy() // On vérifie que la modale d'affichage du document s'est bien ouverte
  })
});

// Test d'intégration GET Bills

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to BillUI", () =>
  {
    test("fetches bills from mock API GET", async () => {
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const getSpy = jest.spyOn(mockStore, "bills") // On simule la fonction "bills" du store (exportée par défaut)
      const bills = await mockStore.bills().list(); // On récupère le contenu de l'objet list de la fonction bills du store
      expect(getSpy).toHaveBeenCalled()
      expect(bills.length).toBe(4); // On vérifie qu'il y'a bien les 4 Bills du store
      console.log(bills[1].id)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

