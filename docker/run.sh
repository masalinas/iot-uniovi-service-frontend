docker run -it --rm --name iot-uniovi-ui \
        --network host \
        -e BASE_PATH="http://127.0.0.1:3000" \
        -e BROKER_PATH="http://localhost:8085" \
        -e BROKER_DEVICE_TOPIC="uniovi/poc/#" \
        -e BROKER_FEEDBACK_TOPIC="uniovi/poc/feedback" \
        iot-uniovi-ui