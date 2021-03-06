import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular'; 
import { AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GoogleCloudVisionServiceProvider } from '../../providers/google-cloud-vision-service/google-cloud-vision-service';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { NutritionPage } from '../nutrition/nutrition';
import { Http } from '@angular/http';
import { GlobalProvider } from '../../providers/global/global'

@IonicPage()
@Component({
  selector: 'page-add-photo',
  templateUrl: 'add-photo.html',
})
export class AddPhotoPage {


  //items: AngularFireList<any[]>;
   items :any[]=[];
    data:number[]=[3,4,1,2,5];
    names:string[]=[];
    predictions:number[]=[];
    nutri:any={};
    calories:string;
    FAT:string;
    PROTIENS:string;
    CARBS:string;
  constructor(public navCtrl: NavController,
             public navParams: NavParams,
             private camera: Camera,
             public http:Http,
             public loadingCtrl:LoadingController,
             private toastCtrl : ToastController,
             private vision: GoogleCloudVisionServiceProvider,
             private db: AngularFireDatabase,
             public global: GlobalProvider,
             private alert: AlertController) {
           
  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPhotoPage');
    this.sort(this.data , this.names);
  }
  sort(data:number[] , names:string[]) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length-i -1; j++) {
        if(data[j] > data[j+1]) {
          var temp = data[j];
          var temp2 = names[j];
          data[j]= data[j+1];
          names[j] = names[j+1];
          data[j+1] = temp;
          names[j+1] = temp2;
        }
        
      }
      
    }
    console.log(this.data)
  }
  takePhoto(){
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 500,
      targetWidth: 500,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      console.log(this.vision.getLabels(imageData))
      const loading = this.loadingCtrl.create({
            content:'Loading...',
            spinner:'dots'
      })
      loading.present()
      this.vision.getLabels(imageData).subscribe((result) => {
       this.saveResults(imageData, result);
      console.log(result);
      loading.dismiss();
     // this.showAlert(result.json().responses);
      }, err => {
        this.showAlert(err);
     });
    }, err => {
      this.showAlert(err);
    });
  }

  saveResults(imageData, results) {
//      console.log(imageData);
      console.log("here is the result");
      console.log(results.json());
      var obj = results.json();
      this.names = obj['dict'];
      this.predictions = obj['predict'][0]['prediction']
      this.sort(this.predictions  , this.names);
      console.log(this.names);
      console.log(this.predictions);
    this.items.push({ imageData: imageData, hresult: {predict:this.predictions,name:this.names}})

    //this.showAlert(this.items[0]); 
    this.toastCtrl.create({
      message:this.items[0],
      duration:3000
      
    }).present();
    //    .then(_ => { })
      //  .catch(err => { this.showAlert(err) });
  }


  saveNutriResults(name, results) {
    //      console.log(imageData);
          console.log("here is the result");
          console.log(results.json());
          var obj = results.json();
          this.calories = obj['calories'];
          this.FAT = obj['totalNutrients']['FAT']['quantity'];
          this.CARBS = obj['totalNutrients']['CHOCDF']['quantity'];
          this.PROTIENS = obj['totalNutrients']['PROCNT']['quantity'];


          //this.predictions = obj['predict'][0]['prediction']
          //this.sort(this.predictions  , this.names);
          // console.log(this.calories);
          // console.log(this.FAT);
          // console.log(this.CARBS);
          // console.log(this.PROTIENS);
          this.global.global_items.push({ food_name: name ,calories_food: this.calories, fat_food: this.FAT , protien_food: this.PROTIENS , carbs_food: this.CARBS });
        //console.log(this.predictions);
        //this.items.push({ imageData: imageData, hresult: {predict:this.predictions,name:this.names}})
    
        //this.showAlert(this.items[0]); 
        this.toastCtrl.create({
          message:this.items[0],
          duration:3000
          
        }).present();
        //    .then(_ => { })
          //  .catch(err => { this.showAlert(err) });
      }

  getNutri(name:string) {
      const loading = this.loadingCtrl.create({
        content:'Wait..',
        spinner:'dots'
      })
      loading.present()
      this.vision.getNutri(name).subscribe((result)=>{
          this.saveNutriResults(name, result);
          console.log(result);
          loading.dismiss()
      } )        
  }

  

  showAlert(message) {
    let alert = this.alert.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

}



