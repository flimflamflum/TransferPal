"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
      const wb = window.workbox

      // Add event listeners to handle PWA lifecycle events
      wb.addEventListener("installed", (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener("controlling", (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      wb.addEventListener("activated", (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (confirm("A newer version of this app is available. Reload to update?")) {
          wb.addEventListener("controlling", (event) => {
            window.location.reload()
          })

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting()
        } else {
          console.log(
            "User rejected to reload the web app, keep using old version. New version will be automatically loaded when the app is reopened.",
          )
        }
      }

      wb.addEventListener("waiting", promptNewVersionAvailable)
      wb.addEventListener("externalwaiting", promptNewVersionAvailable)

      // ISSUE - this is not working as expected, why?
      // I could only make message event listener work when I manually add this listener into sw.js file
      wb.addEventListener("message", (event) => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })

      /*
      wb.addEventListener('redundant', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      wb.addEventListener('externalinstalled', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      wb.addEventListener('externalactivated', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log(event)
      })
      */

      // never forget to call register as auto register is turned off in next.config.js
      wb.register()
    }
  }, [])

  return null
}

