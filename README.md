Este repositório contém o código criado durante o curso Clean Code e Clean Architecture com Rodrigo Branas, o conteúdo apresentado foi modificado visando aprofundamento em algumas técnicas do meu interesse particular.

# Casos de uso
## UC1 - Signup
Ator: Passageiro, Motorista
Input: name, email, cpf, carPlate, password, isPassenger, isDriver
Output: account_id

-[ ] deve verificar se o email já existe e lançar um erro caso já exista
-[ ] deve gerar o account_id (uuid)
-[ ] deve validar o nome, email e cpf
-[ ] deve apenas salvar a senha, por enquanto em claro

## UC2 - GetAccount
Input: account_id
Output: todas as informações da conta

Observações:
* O objetivo é refatorar o código utilizando as técnicas de refactoring vistas na aula 1 como renomear variável, extrair método, simplificar condicional, tratar exceções adequadamente, remover comentários, entre outras. Não se preocupe com o design e a arquitetura por enquanto, separe as responsabilidades seguindo o que você acredita ser o que faz mais sentido pra você. Na aula 2 vamos abordar o design de acordo com a Arquitetura Hexagonal.
* Faça testes tanto na API quanto nas regras de negócio
* Utilize o Docker para subir o banco de dados por meio do comando "yarn docker:start" ou utilize uma instalação local, aplicando o script create.sql

## UC3 - Solicitar corrida
Ator: Passageiro
Input: passenger_id (account_id), from (lat, long), to (lat, long)
Output: ride_id

-[ ] deve verificar se o account_id tem is_passenger true
-[ ] deve verificar se já não existe uma corrida do passageiro em status diferente de "completed", se existir lançar um erro
-[ ] deve gerar o ride_id (uuid)
-[ ] deve definir o status como "requested"
-[ ] deve definir date com a data atual

## UC4 - GetRide
Input: ride_id
Output: todos as informações da ride juntamente com os dados do passageiro e do motorista (inicialmente null, definido após o use case de AcceptRide)

Considere o modelo de dados:
create table ccca.ride (
  ride_id uuid,
  passenger_id uuid,
  driver_id uuid,
  status text,
  fare numeric,
  distance numeric,
  from_lat numeric,
  from_long numeric,
  to_lat numeric,
  to_long numeric,
  date timestamp
);

## UC5 - AcceptRide
Ator: Motorista
Input: ride_id, driver_id (account_id)
Output: void

-[ ] deve verificar se o account_id tem is_driver true
-[ ] deve verificar se o status da corrida é "requested", se não for, lançar um erro
-[ ] deve verificar se o motorista já tem outra corrida com status "accepted" ou "in_progress", se tiver lançar um erro
-[ ] deve associar o driver_id na corrida
-[ ] deve mudar o status para "accepted"

## UC6 - StartRide
Ator: Motorista
Input: ride_id
Output: void

-[ ] Deve verificar se a corrida está em status "accepted", se não estiver lançar um erro
-[ ] Deve modificar o status da corrida para "in_progress"

## UC7 - UpdatePosition
Ator: Sistema
Input: ride_id, lat, long
Output: void

-[ ] Deve verificar se a corrida está em status "in_progress", se não estiver lançar um erro
-[ ] Deve gerar o position_id
-[ ] Deve salvar na tabela position: position_id, ride_id, lat, long e date

Considere o modelo de dados:
create table ccca.position (
  position_id uuid,
  ride_id uuid,
  lat numeric,
  long numeric,
  date timestamp
);

## UC8 - FinishRide
Ator: Motorista
Input: ride_id
Output: void

-[ ] Deve verificar se a corrida está em status "in_progress", se não estiver lançar um erro
-[ ] Deve obter todas as positions e calcular a distância entre cada uma delas, para isso utilize um algoritmo que receba duas coordenadas (lat, long) e retorne a distância entre elas em km.
-[ ] Com a distância total calculada, calcule o valor da corrida (fare) multiplicando a distância por 2,1
-[ ] Atualizar a corrida com o status "completed", a distância e o valor da corrida (fare)

## UC9 - ProcessPayment
Ator: Sistema
Input: rideId, creditCardToken, amount
Output: void

-[ ] Deve simular o comportamento de um gateway de pagamento, sendo chamado a partir do use case FinishRide e fazendo o processamento do pagamento com base no cartão de crédito do passageiro
-[ ] O status deve ser sempre success
-[ ] Deve persistir na tabela transaction

Considere o modelo de dados:
create table ccca.transaction (
  transaction_id uuid primary key,
  ride_id uuid,
  amount numeric,
  date timestamp,
  status text
);

-[ ] Separe o bounded context de payment, que tem o use case ProcessPayment, realizando a integração por meio da fila
-[ ] Separe os bancos de dados por bounded context (utilize o docker-compose abaixo)
-[ ] Adote o mecanismo de DI ao invés do constructor
-[ ] Implemente um serviço de consulta que retorne os dados da corrida, do passageiro, do motorista e também do pagamento