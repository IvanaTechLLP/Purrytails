import subprocess
import time

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e.stderr}")
        return None

def main():
    # Get the container ID of the running container with the image "purrytails-frontend"
    container_id = run_command("docker ps -a -q --filter ancestor=purrytails-frontend")
    
    if container_id:
        print(f"Stopping and removing container: {container_id}")
        run_command(f"docker rm -f {container_id}")
    else:
        print("No running container found for 'purrytails-frontend'")
    
    # Remove the images
    run_command("docker rmi purrytails-frontend")
    run_command("docker rmi abhaymathur21/purrytails:frontend")
    print("Images removed successfully!")
    
    # Run docker-compose up
    print("Starting docker-compose up...")
    compose_process = subprocess.Popen("docker-compose up", shell=True)
    
    # Wait for 30 seconds
    time.sleep(30)
    
    # Shut down docker-compose
    print("Stopping docker-compose...")
    compose_process.terminate()
    time.sleep(5)  # Give some time to shut down properly
    run_command("docker-compose down")
    
    # Tag and push the new image
    run_command("docker tag purrytails-frontend abhaymathur21/purrytails:frontend")
    run_command("docker push abhaymathur21/purrytails:frontend")
    
    print("Process completed successfully!")

if __name__ == "__main__":
    main()
