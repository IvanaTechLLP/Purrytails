from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc
import time

# Set up the WebDriver (ensure you have the correct driver installed)
# chrome_driver_path = "C:/browserdrivers/chromedriver-win64/chromedriver.exe"
# service = Service(chrome_driver_path)
# driver = webdriver.Chrome(service=service)
driver = uc.Chrome(driver_executable_path="C:/browserdrivers/chromedriver-win64/chromedriver.exe")
driver.get("https://purrytails.in")

# Maximize browser window
driver.maximize_window()

try:
    # Open the website
    driver.get("https://purrytails.in")

    # Click on the login button
    login_link = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//a[@href="/login" and contains(@class, "right")]'))
    )

    # Click the "Login" link
    login_link.click()

    # Click on 'Login with Google'
    login_with_google_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Sign in with Google")]'))
    )
    login_with_google_button.click()
    
    main_window = driver.current_window_handle  # Store the main window handle
    WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))  # Wait for the popup to appear

    # Switch to the popup window
    for handle in driver.window_handles:
        if handle != main_window:
            driver.switch_to.window(handle)
            break

    email_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//input[@type="email"]'))
    )
    email_field.send_keys("a21.mathur21@gmail.com")
    email_field.send_keys(Keys.RETURN)  # Press Enter
    
    time.sleep(5)

    # Wait for the password field and enter the password
    password_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//input[@type="password"]'))
    )
    password_field.send_keys("quixoticoblivion")
    password_field.send_keys(Keys.RETURN)  # Press Enter
    time.sleep(10)
    # Wait for the fields to appear on the next page
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//input[@placeholder="Enter phone number"]'))
    )

    # Fill out the fields (replace with actual field names/IDs and values)
    field_1 = driver.find_element(By.XPATH, '//input[@placeholder="Enter phone number"]')
    field_1.send_keys("9920980869")

    field_2 = driver.find_element(By.XPATH, '//input[@placeholder="Enter address"]')
    field_2.send_keys("Mumbai, India")
    
    next_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//span[@class="arrow next-arrow")]'))
    )
    next_button.click()
    
    field_3 = driver.find_element(By.XPATH, '//div[@class="Enter pet\'s name"]')
    field_3.send_keys("Pichku")
    
    wait = WebDriverWait(driver, 10)
    scroller_container = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "year-scroller"))
    )

     # Locate the item that says "10 years"
    ten_years_item = driver.find_element(By.XPATH, "//div[@class='scroller-item' and text()='10 years']")
    
    # Scroll into view if necessary and click
    actions = ActionChains(driver)
    actions.move_to_element(ten_years_item).click().perform()
    
    wait = WebDriverWait(driver, 10)
    scroller_container = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "month-scroller"))
    )

    # Locate the item that says "10 years"
    nine_months_item = driver.find_element(By.XPATH, "//div[@class='scroller-item' and text()='9 months']")
    
    # Scroll into view if necessary and click
    actions = ActionChains(driver)
    actions.move_to_element(nine_months_item).click().perform()

    pet_option = wait.until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='pet-option ']/img[@alt='Dog']"))
    )
    
    # Locate the parent div and click it
    parent_div = pet_option.find_element(By.XPATH, "..")  # Go up one level to the div
    parent_div.click()
    
    next_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//span[@class="arrow next-arrow")]'))
    )
    next_button.click()
    
    sex_option = wait.until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='sex-option ']/img[@alt='Male']"))
    )
    
    # Locate the parent div and click it
    parent_div = sex_option.find_element(By.XPATH, "..")  # Go up one level to the div
    parent_div.click()
    
    
    field_4 = driver.find_element(By.XPATH, '//input[@placeholder="Other"]')
    field_4.send_keys("Pekingese Lion")

    scroller_container = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "year-scroller"))
    )

     # Locate the item that says "10 years"
    ten_kg_item = driver.find_element(By.XPATH, "//div[@class='scroller-item' and text()='10 kg']")
    
    # Scroll into view if necessary and click
    actions = ActionChains(driver)
    actions.move_to_element(ten_years_item).click().perform()

    next_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//span[@class="arrow next-arrow")]'))
    )
    next_button.click()
    
    field_5 = driver.find_element(By.XPATH, '//input[@placeholder="Enter food brand"]')
    field_5.send_keys("Pedigree")
    
    field_6 = driver.find_element(By.XPATH, '//input[@placeholder="Enter food quantity"]')
    field_6.send_keys("100gm")
    
    

    # Click the save button
    save_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Save")]'))
    )
    save_button.click()

    print("Form filled and saved successfully!")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser
    driver.quit()
