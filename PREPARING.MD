# Cluster Monitoring
## Tutorial

Este tutorial tem como objetivo, descrever o passo a passo da instalação e configuração de um serviço de monitoramento de cluster docker. Basicamente, os requisitos necessários para a instalação e configuração é ter funcionando um ambiente com docker-machine e um cluster swarm implantado. 
Neste experimento o Rancher é utilizado para orquestrar o cluster. Porém, o Rancher mostrou-se complexo, se comparado ao swarm para a implantação do serviço de monitoramento, por isso, utiliza-se o Rancher como tecnologia de orquestração do cluster, e o swarm para conseguir monitorar os hosts do cluster. 
O ambiente é composto de 3 nós, 1 manager, que também é o rancher-server e 2 workers que também são rancher-nodes. Todos os serviços utilizados na implantação do do mecanismo de monitoramento foram instalados no nó manager. A seguir será descrito os passos necessários para a implantação para o serviço de monitoramento, assumimos que os hosts do cluster já estão criados:

acessar a máquina manager

    docker-machine ssh rancher-server

iniciar o modo swarm

    docker swarm init --advertise-addr 192.168.99.100

ao iniciar o modo swarm, o comando para adicionar os nós workers é apresentado, algo semelhante ao comando: 
docker swarm join --token SWMTKN-1-0124752iaqvt7uy1fcsne5u3zd3b03fupen2qlajg0f4esl1vz-1g5iclmxdpf56bgm0wlx7qmq6 192.168.99.100:2377

acessar os nós “worker” e execute este comando

acessar as máquinas worker

    docker-machine ssh rancher-node

execute

    docker swarm join --token [...]

verificar o funcionamento

    docker-machine ssh rancher-server
	server$ docker node ls

criar uma rede tipo overlay para comunicação entre as ferramentas

    server$ docker network create -d overlay --attachable monitoring

criar o servidor influx para guardar as informações monitoradas

    server$ docker run -d --restart=always -v /data:/var/lib/influxdb --network monitoring --name influx influxdb

criar a base de dados dentro do influx
    
    server$ docker exec -it influx influx -execute 'CREATE DATABASE cadvisor'

criar os serviços agentes de monitoramento

    server$ docker service create --name agentes-monitor --network monitoring --mode global --mount type=bind,source=/,destination=/rootfs,readonly=true --mount type=bind,source=/var/run,destination=/var/run  --mount type=bind,source=/sys,destination=/sys,readonly=true  --mount type=bind,source=/var/lib/docker,destination=/var/lib/docker,readonly=true google/cadvisor -logtostderr -docker_only -storage_driver=influxdb -storage_driver_db=cadvisor -storage_driver_host=influx:8086

verificar se os serviços funcionam

    server$ docker service ls

criar volume grafana

    server$ docker volume create grafana-storage

iniciar o serviço grafana

    server$ docker run -d --restart=always -v grafana-storage:/var/lib/grafana --network monitoring --name grafana -p 3000:3000 grafana/grafana

acessar o grafana via browser

    http://ip-do-host:3000/login

user e password
admin e admin

estando dentro do grafana, deve-se adicionar o Data Source
Name: influx
URL: http://influx:8086
Acess: Server(Default)
Database: cadvisor
Salva e testa!

importar o dashboard para este data source
utilizei um disponibilizado por Hanzel Jesheen, encontra-se aqui: dashboard
vai até o (+) + import + Upload .json File

## REFERÊNCIAS
https://www.mundodocker.com.br/coleta-metricas-no-docker-swarm/
http://docs.grafana.org/http_api/alerting/
http://docs.grafana.org/alerting/rules/
http://docs.grafana.org/alerting/notifications/