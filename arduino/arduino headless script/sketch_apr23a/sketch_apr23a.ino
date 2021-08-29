int led = 13, avlb = 0; 

void setup() 
{ 
Serial.begin(9600);
pinMode(led, OUTPUT); 
Serial.println("started");
}

void loop() 
{ 
  digitalWrite(ledPin, HIGH);
  if (Serial.available() > 0)
  {
    Serial.println("available");
    Serial.println(Serial.available());  
    delay(2000);    
  if(Serial.read())
  {
    Serial.println("read");
    Serial.println(Serial.read());
    delay(2000);
  }  
  }

else
{
  Serial.println("not available");
  delay(1000);
}

}
